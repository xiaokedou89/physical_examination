<template>
  <!-- 导航栏 -->
  <navbar>
    <template v-slot:right>
      <div class="right-container">
        <button class="upload" type="button" @click="showUpload">{{$t('upload')}}</button>
        <user @showPassword="showPassword" @showUserInfo="showUserInfo"/>
      </div>
    </template>
  </navbar>
  <!-- 内容主体 -->
  <div class="goods-container">
    <!-- 筛选部分 -->
    <el-card class="filter">
      <!-- 筛选内容区域 -->
      <div class="filter-container">
        <!-- 左边筛选条件部分 -->
        <el-form ref="filterForm" :model="filter" label-width="80px">
          <!-- 病人筛选 -->
          <el-form-item :label="getLabel($t('patientName'))">
            <el-input v-model="filter.patientName" :placeholder="$t('patientNamePlace')"></el-input>
          </el-form-item>
          <!-- 起始时间 -->
          <el-form-item :label="getLabel($t('startTime'))">
            <el-date-picker
              v-model="filter.begin"
              type="date"
              :placeholder="$t('timePlace')">
            </el-date-picker>
          </el-form-item>
          <!-- 结束时间 -->
          <el-form-item :label="getLabel($t('endTime'))">
            <el-date-picker
              v-model="filter.end"
              type="date"
              :placeholder="$t('timePlace')">
            </el-date-picker>
          </el-form-item>
          <!-- 订单状态 -->
          <el-form-item :label="getLabel($t('status'))">
            <el-select v-model="filter.status" :placeholder="$t('statusPlace')">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <!-- 右边按钮部分 -->
        <div class="btn-group">
          <button class="btn-confirm" @click="handleFilter">{{$t('checkout')}}</button>
          <button class="btn-reset" @click="resetFilter">{{$t('reset')}}</button>
        </div>
      </div>
    </el-card>
    <!-- 数据列表部分 -->
    <div class="table-container">
      <h3>{{$t('dataList')}}</h3>
      <el-table v-loading="loading" :data="list" :empty-text="$t('noData')">
        <el-table-column align="center" prop="name" :label="$t('patient')">
          <template #default="scope">
            {{ scope.row.patientName }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('createTime')">
          <template #default="scope">
            {{ getTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('diagnoseReportNo')">
          <template #default="scope">
            {{ scope.row.diagnoseReportNo }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('status')">
            <template #default="scope">
              {{ getStatus(scope.row.status) }}
            </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('model')">
          <template #default="scope">
            <el-button 
              type="text" 
              :disabled="getModelFlag(scope.row.status)"
              @click="linkToModel(scope.row)"
            >
              {{ getModelBtn(scope.row.status) }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('action')">
          <template #default="scope">
            <el-button 
              :disabled="progressFlag" 
              type="text" 
              @click="showSet(scope.row)"
            >
              {{$t('set')}}
            </el-button>
            <el-button 
              :disabled="scope.row.report === null && !scope.row.report" 
              :loading="scope.row.downloading" 
              type="text" 
              @click="download(scope.row)"
            >
              {{$t('download')}}
            </el-button>
            <el-button 
              type="text" 
              :disabled="scope.row.modelData === null || scope.row.report === null" 
              @click="linkToFeed(scope.row)"
            >
              {{$t('feedback')}}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange"></pagination>
      </div>
    </div>
    <!-- 上传弹框 -->
    <el-dialog :title="$t('uploadData')" v-model="uploadFlag" width="40%">
      <el-form ref="orderForm" :rules="getRules" :model="uploadForm" label-width="80px" label-position="left">
        <el-form-item prop="patientName" :label="$t('patientName')">
          <el-input v-model="uploadForm.patientName" placeholder=""></el-input>
        </el-form-item>
        <el-form-item prop="diagnoseReportNo" :label="$t('diagnoseReportNo')">
          <el-input v-model="uploadForm.diagnoseReportNo" placeholder=""></el-input>
        </el-form-item>
        <el-form-item class="el-form-item-upload">
          <div class="upload-container">
            <p class="upload-title">{{$t('uploadDataTitle')}}</p>
            <el-upload
              ref="uploadForm"
              :action="getUploadUrl('common')"
              :headers="headers"
              accept=".zip"
              :before-upload="beforeUpload"
              :on-progress="fileProgress"
              :on-success="fileUploadSuc"
              :on-error="fileUploadFail"
              :on-remove="progressRemove"
              :show-file-list="uploadForm.fileListFlag"
              :disabled="uploadForm.fileUploadDisabled"
            >
              <div class="upload-group">
                <span class="upload-file-box" @click="handleRemove">{{ uploadForm.showFilename }}</span>
                <button type="button" class="upload-btn" @click="handleRemove">{{ getUploadBtnText }}</button>
              </div>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <button class="footer-cancel" @click="uploadCancel">{{$t('cancel')}}</button>
        <button class="footer-confirm" @click="uploadConfirm">{{$t('confirm')}}</button>
      </template>
    </el-dialog>
    <!-- 修改密码弹框 -->
    <el-dialog :title="$t('setPasswordTitle')" v-model="passwordFlag" v-if="passwordFlag" width="42%">
      <el-form ref="passwordForm" :rules="rules" :model="passwordObj" label-width="100px" label-position="left">
        <el-form-item prop="oldPassword" :label="getLabel($t('oldPassword'))">
          <el-input v-model="passwordObj.oldPassword" :placeholder="$t('oldPasswordPlace')" autocomplete="on" show-password />
        </el-form-item>
        <el-form-item prop="newPassword" :label="getLabel($t('newPassword'))">
          <el-input v-model="passwordObj.newPassword" :placeholder="$t('newPasswordPlace')" autocomplete="on" show-password />
        </el-form-item>
        <el-form-item prop="repeatPassword" :label="getLabel($t('repeatPassword'))">
          <el-input v-model="passwordObj.repeatPassword" :placeholder="$t('repeatPasswordPlace')" autocomplete="on" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <button class="footer-cancel" @click="passwordCancel">{{$t('cancel')}}</button>
        <button class="footer-confirm" @click="passwordConfirm">{{$t('confirm')}}</button>
      </template>
    </el-dialog>
    <!-- 修改信息弹框 -->
    <el-dialog :title="$t('setUserInfoTitle')" v-model="userInfoFlag" v-if="userInfoFlag" width="40%">
      <el-form ref="userInfoForm" :rules="rules" :model="userInfo" label-width="120px" label-position="right">
        <el-form-item prop="name" :label="getLabel($t('name'))">
          <el-input v-model="userInfo.name" :placeholder="$t('namePlace')" />
        </el-form-item>
        <el-form-item prop="organization" :label="getLabel($t('organization'))">
          <el-input v-model="userInfo.organization" :placeholder="$t('organizationPlace')" />
        </el-form-item>
        <el-form-item prop="phone" :label="getLabel($t('phone'))">
          <el-input v-model="userInfo.phone" :placeholder="$t('phonePlace')" />
        </el-form-item>
        <el-form-item prop="email" :label="getLabel($t('email'))">
          <el-input v-model="userInfo.email" :placeholder="$t('emailPlace')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <button class="footer-cancel" @click="userInfoCancel">{{$t('cancel')}}</button>
        <button class="footer-confirm" @click="userInfoConfirm">{{$t('confirm')}}</button>
      </template>
    </el-dialog>
  </div>
  
</template>
<script>
import navbar from '../components/nav/navbar.vue'
import moment from 'moment'
import pagination from '../components/pagination/pagination.vue'
import user from '../components/user/user.vue'
import * as global from '@/utils/global.js'
import * as api from '@/api/orders.js'
import * as userApi from '@/api/user.js'
import * as fileApi from '@/api/file.js'
import * as rule from '@/utils/rules.js'
import { getToken } from '@/utils/auth.js'
import { reactive } from 'vue'

const rules = {
  patientName: rule.nameRule,
  diagnoseReportNo: rule.requiredRule,
  oldPassword: rule.requiredRule,
  newPassword: rule.passwordRule,
  repeatPassword: rule.passwordRule,
  name: rule.unnameRule,
  organization: rule.unnameRule,
  phone: rule.unphoneRule,
  email: rule.emailRules
}

const setRules = {
  patientName: rule.unnameRule
}

const defaultParams = {
  begin: '',
  end: '',
  patientName: '',
  status: -1,
  size: global.size,
  pkId: 0,
  sortMode: 'DESC',
  timeColumn: 'createTime'
}

const defaultFilter = {
  patientName: '',
  begin: '',
  end: '',
  status: -1,
}

const defaultUpload = {
  patientName: '',
  modelSource: null,
  diagnoseReportNo: '',
  confirmFlag: false,
  uploadProgressFlag: false, // 当前有文件上传时设定的开关
  fileListFlag: true, // 上传组件是否显示上传文件列表开关
  fileUploadDisabled: false, // 控制上传组件是否禁用
  showFilename: '' // 上传文本框中显示的文件名
}

const defaultPassword = {
  oldPassword: '',
  newPassword: '',
  repeatPassword: ''
}

let defaultUserInfo = {
  name: '',
  organization: '',
  phone: '',
  email: ''
}

export default {
  name: 'goods',
  components: {
    navbar,
    user,
    pagination
  },
  data() {
    return {
      rules,
      setRules,
      baseUrl: global.network.globalURL,
      fileUploadUrl: global.network.fileUploadURL,
      headers: {},
      // 主列表保存的最小id
      minId: 0,
      // 最大id
      maxId: 0,
      // 列表加载开关
      loading: false,
      // 分页防抖
      flag: false,
      // 筛选条件开关
      filterFlag: false,
      // 获取列表传参
      params: Object.assign({}, defaultParams),
      // 分页页数
      pageCount: 1,
      // 主列表数据
      list: [],
      // 上传弹框开关
      uploadFlag: false,
      // 禁用上传按钮和修改按钮开关
      progressFlag: false,
      // 判断上传弹框是点击的上传还是修改
      isSet: false,
      // 修改弹框绑定对象
      setObj: {},
      // 上传弹框绑定对象
      uploadForm: Object.assign({}, defaultUpload),
      // 上传
      uploadObj: Object.assign({}, defaultUpload),
      uploadFormSaveNode: {},
      // 筛选部分绑定对象
      filter: Object.assign({}, defaultFilter),
      options: global.orderStatusArr,
      passwordFlag: false,
      passwordObj: Object.assign({}, defaultPassword),
      userInfoFlag: false,
      userInfo: Object.assign({}, defaultUserInfo),
    }
  },
  created() {
    this.initUserInfo()
    this.initList(this.params)
    this.getToken()
  },
  computed:{
    getTime() {
      return function(time) {
        return moment(time).format('YYYY/MM/D HH:mm')
      }
    },
    getStatus() {
      return global.orderStatus
    },
    getUploadUrl() {
      const _this = this
      return function (type) {
        return _this.baseUrl + _this.fileUploadUrl + type
      }
    },
    getUploadBtnText() {
      return this.uploadForm.fileUploadDisabled ? this.$t('uploadBtnDel') : this.$t('uploadBtnSelect')
    },
    getRules() {
      return this.isSet ? this.setRules : this.rules
    },
    getLabel() {
      return function (label) {
        return `${label}:`
      }
    },
    getModelBtn() {
      const _this = this
      return function (status) {
        return status > 30 ? _this.$t('checkModel') : _this.$t('noModel')
      }
    },
    getModelFlag() {
      return function (status) {
        return status > 30 ? false : true
      }
    }
  },
  watch: {
    uploadFlag(val) {
      const that = this
      if (val) {
        setTimeout(() => {
          that.$refs.uploadForm.clearFiles()
        },0)
      }
    }
  },
  methods: {
    // 初始化当前登录用户信息
    initUserInfo() {
      userApi.getInfo()
      .then(res => {
        if (res.code === 20000) {
          defaultUserInfo = res.data
          this.userInfo = Object.assign({}, defaultUserInfo)
        }
      })
      .catch(err => {
        this.$message({
          message: err,
          type: 'error',
          duration: 1500
        })
      })
    },
    // 通过点击上传打开上传弹框
    showUpload() {
      if (this.progressFlag) {
        return
      }
      // 上次打开弹框如果是点击的上传，需要保存之前的上传进度
      !this.isSet && (this.uploadObj = Object.assign({}, this.uploadForm))
      this.isSet = false
      this.uploadForm = Object.assign({}, this.uploadObj)
      this.uploadFlag = true
    },
    // 通过点击修改打开上传弹框
    showSet(item) {
      !this.isSet && (this.uploadObj = Object.assign({}, this.uploadForm))
      this.isSet = true
      this.uploadFormSaveNode = item
      this.uploadForm = Object.assign({}, item)
      this.uploadFlag = true
    },
    // 上传文件前检查格式回调
    beforeUpload(file) {
      if (this.uploadForm.uploadProgressFlag) {
        this.$message({
          message: this.$t('uploadWarning'),
          type: 'warning',
          duration: 1500
        })
        return !this.uploadForm.uploadProgressFlag
      }
      let extension = file.name.substring(file.name.lastIndexOf('.') + 1),
          size = file.size,
          extensionFlag = extension === 'zip' && size <= 500 * 1024 * 1024 && !this.uploadForm.uploadProgressFlag ? true : false
      if (!extensionFlag) {
        this.$message({
          message: this.$t('uploadLimite'),
          type: 'warning',
          duration: 1500
        })
      }
      return extensionFlag
    },
    // 文件上传中回调
    fileProgress() {
      this.uploadForm.uploadProgressFlag = true
      this.progressFlag = true
    },
    // 上传成功回调
    fileUploadSuc(e) {
      this.uploadForm.uploadProgressFlag = false
      this.progressFlag = false
      if (e.code === 20000) {
        this.uploadForm.showFilename = e.data.oldFilename
        this.uploadForm.fileUploadDisabled = true
        this.uploadForm.fileListFlag = false
        if (this.isSet) {
          this.uploadForm.upModelSource = e.data.filename
          this.uploadFormSaveNode.showFilename = e.data.oldFilename
          this.uploadFormSaveNode.fileUploadDisabled = true
          this.uploadFormSaveNode.fileListFlag = false
          this.uploadFormSaveNode.uploadProgressFlag = false
          this.uploadFormSaveNode.upModelSource = e.data.filename
        } else {
          this.uploadForm.modelSource = e.data.filename
          this.uploadObj = Object.assign(this.uploadObj, this.uploadForm)
        }
      } else {
        this.$refs.uploadForm.clearFiles()
        this.$message({
          message: e.message || this.$t('uploadFail'),
          type: 'error',
          duration: 1500
        })
      }
    },
    // 上传失败回调
    fileUploadFail(e) {
      this.uploadForm.uploadProgressFlag = false
      this.progressFlag = false
      this.$message({
        message: e.message || this.$t('uploadFail'),
        type: 'error',
        duration: 1500
      })
    },
    // 从上传文件列表移除上传文件回调
    progressRemove() {
      this.uploadForm.uploadProgressFlag = false
      this.progressFlag = false
    },
    // 上传成功后点击删除已上传的文件
    handleRemove() {
      if (!this.uploadForm.fileUploadDisabled) {
        return
      }
      let filename = this.isSet ? this.uploadForm.upModelSource : this.uploadForm.modelSource
      fileApi.delFile('common', {
        filename
      })
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('delSuccess'),
              type: 'success',
              duration: 1500
            })
            this.$refs.uploadForm.clearFiles()
            this.uploadForm.fileListFlag = true
            this.uploadForm.fileUploadDisabled = false
            this.uploadForm.showFilename = ''
            if (this.isSet) {
              this.uploadForm.upModelSource = null
              this.uploadFormSaveNode = Object.assign(this.uploadFormSaveNode, this.uploadForm)
            } else {
              this.uploadForm.modelSource = null
              this.uploadObj = Object.assign(this.uploadObj, this.uploadForm)
            } 
          }
        })
        .catch(err => {
          this.$message({
            message: `${this.$t('delFail')}:${err}`,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 点击确认上传
    uploadConfirm() {
      let uploadFile,
          apiFile,
          sucText
      if (this.isSet) {
        if (this.uploadFormSaveNode.confirmFlag) return
        this.uploadFormSaveNode.confirmFlag = true
        uploadFile = this.uploadForm.upModelSource
        apiFile = api.setOrder
        sucText = this.$t('setOrderSuccess')
      } else {
        if (this.uploadObj.confirmFlag) return
        this.uploadObj.confirmFlag = true
        uploadFile = this.uploadForm.modelSource
        apiFile = api.placeOrder
        sucText = this.$t('orderSuccess')
      }
      if ( !this.isSet && !uploadFile) {
        this.$message({
          message: this.$t('noUploadFile'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.$refs.orderForm.validate(vail => {
        if (vail) {
          this.isSet && (this.uploadForm.modelSource = this.uploadForm.upModelSource)
          apiFile(this.uploadForm)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: sucText,
                  type: 'success',
                  duration: 1500
                })
                if (this.isSet) {
                  if (this.uploadFormSaveNode.modelSource === null || this.uploadForm.modelSource === null) {
                    this.uploadFlag = false
                    this.initList(this.params)
                  } else {
                    fileApi.delFile('common', {
                      filename: this.uploadFormSaveNode.modelSource
                    })
                    .then(res => {
                      if (res.code === 20000) {
                        this.$message({
                          message: this.$t('failDeled'),
                          type: 'success',
                          duration: 1500
                        })
                        this.uploadFlag = false
                        this.initList(this.params)
                      }
                    })
                    .catch(err => {
                      this.uploadFormSaveNode.confirmFlag = false
                      this.$message({
                        message: `${this.$t('failDelFail')}：${err}`,
                        type: 'error',
                        duration: 1500
                      })
                    })
                  }
                } else {
                  this.uploadObj.confirmFlag = false
                  console.log(defaultUpload)
                  this.uploadObj = JSON.parse(JSON.stringify(defaultUpload))
                  console.log(this.uploadObj)
                  this.uploadForm = JSON.parse(JSON.stringify(defaultUpload))
                  this.uploadFlag = false
                  this.initList(this.params)
                }
              } 
            })
            .catch(err => {
              if (!this.isSet) this.uploadObj.confirmFlag = false
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
            })
        } else {
          this.$message({
            message: this.$t('validateNone'),
            type: 'warning',
            duration: 1500
          })
        }
      })
    },
    // 点击取消上传
    uploadCancel() {
      this.uploadFlag = false
    },
    // 点击筛选部分查询按钮
    handleFilter() {
      this.filter.begin = this.filter.begin ? moment(this.filter.begin).format('YYYY-MM-D HH:mm') : ''
      this.filter.end = this.filter.end ? moment(this.filter.end).format('YYYY-MM-D HH:mm') : ''
      this.filterFlag = true
      this.params = {...this.params, ...this.filter}
      this.params.pkId = 0
      this.params.sortMode = 'DESC'
      this.pageCount = 1
      this.initList(this.params)
    },
    // 点击筛选部分重置按钮
    resetFilter() {
      this.filter = {...defaultFilter}
      this.params = Object.assign(this.params, {
        begin: '',
        end: '',
        patientName: '',
        status: -1,
        pkId: 0,
        sortMode: 'DESC',
        timeColumn: 'createTime'
      })
    },
    getToken() {
      const token = getToken()
      if (token && token !== 'Bearer null' && token!== 'Beare undefined') {
        this.headers['authorization'] = getToken()
      }
    },
    initList(params) {
      this.loading = true
      api.getOrders(params)
        .then(res => {
          if (res.code === 20000) {
            for (let [index, item] of res.data.entries()) {
              item.downloading = false
              item.uploadProgressFlag = false
              item.fileListFlag = true
              item.fileUploadDisabled = false
              item.upModelSource = null 
              item.showFilename = ''
              item.confirmFlag = false
              reactive(item)
            }
            this.flag = false
            this.filterFlag = false
            this.list = res.data
            this.sortList()
            this.loading = false
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            this.filterFlag && (this.list = [])
            this.flag = false
            this.loading = false
            if (this.params.sortMode === 'DESC') {
              this.pageCount !== 1 && this.pageCount--
            } else {
              this.pageCount !== 1 && this.pageCount++
            }
          }
        })
        .catch(err => {
          this.loading = false
          this.flag = false
          if (this.params.sortMode === 'DESC') {
            this.pageCount !== 1 && this.pageCount--
          } else {
            this.pageCount !== 1 && this.pageCount++
          }
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    sortList() {
      this.list.sort((a, b) => {
        if (a.id > b.id) {
          return -1
        } else if (a.id < b.id) {
          return 1
        } else {
          return 0
        }
      })
      this.maxId = this.list[0].id
      this.minId = this.list[this.list.length - 1].id
    },
    // 点击分页下一页
    nextPage() {
      if (!this.flag) {
        this.flag = true
        this.pageCount++
        this.params.sortMode = 'DESC'
        this.params.pkId = this.minId
        this.initList(this.params)
      } else {
        return 
      }
    },
    // 点击分页上一页
    prevPage() {
      if (this.pageCount <= 1) {
        return
      } else {
        if (!this.flag) {
          this.flag = true
          this.pageCount--
          this.params.sortMode = 'ASC'
          this.params.pkId = this.maxId
          this.initList(this.params)
        } else {
          return
        }
      }
    },
    // 分页页数变化
    pageSizeChange(e) {
      this.params.sortMode = 'DESC'
      this.params.size = e
      this.params.pkId = 0
      this.pageCount = 1
      this.initList(this.params)
    },
    // 下载
    download(item) {
      const that = this
      this.$message({
        message: this.$t('downloading'),
        type: 'success',
        duration: 1500
      })
      item.downloading = true
      let url = `${global.network.globalURL}${global.network.getFile('common')}${item.report}`,
          xhr = new XMLHttpRequest()
      console.log(url)
      xhr.open('get', url, true)
      xhr.setRequestHeader('authorization', getToken())
      xhr.responseType = 'blob'
      xhr.onload = function () {
        let blob,
            link,
            fileURL;
        if (this.status >= 200 && this.status <= 300 || this.status == 304) {
          blob = this.response
          link = document.createElement('a')
          fileURL = window.URL.createObjectURL(blob)
          link.href = fileURL
          link.download = item.report
          link.click()
          item.downloading = false
        } else {
          item.downloading = false
          that.$message({
            message: this.$t('downloadFail'),
            type: 'error',
            duration: 1500
          })
        }
      }
      xhr.send()
    },
    // 点击反馈跳转到订单对应反馈项
    linkToFeed(item) {
      this.$router.push({
        path: '/feedback',
        query: {
          orderId: item.id
        }
      })
    },
    // 点击修改密码显示弹框
    showPassword() {
      this.passwordObj = Object.assign({}, defaultPassword)
      this.passwordFlag = true
    },
    // 修改密码弹框确认
    passwordConfirm() {
      if (this.passwordObj.newPassword !== this.passwordObj.repeatPassword) {
        this.$message({
          message: this.$t('repeatPasswordFail'),
          type: 'error',
          duration: 1500
        })
        return
      }
      this.$refs.passwordForm.validate(valid => {
        if (valid) {
          userApi.setPassword(this.passwordObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('setPasswordSuc'),
                  type: 'success',
                  duration: 1500
                })
                this.passwordFlag = false
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
            })
        } else {
          this.$message({
            message: this.$t('passwordValFail'),
            type: 'warning',
            duration: 1500
          })
        }
      })
    },
    // 修改密码取消
    passwordCancel() {
      this.passwordFlag = false
    },
    // 点击修改信息显示弹框
    showUserInfo() {
      this.userInfo = Object.assign({}, defaultUserInfo)
      this.userInfoFlag = true
      console.log('show-userInfo')
    },
    // 点击修改信息确认
    userInfoConfirm() {
      this.$refs.userInfoForm.validate(valid => {
        if (valid) {
          userApi.setUserInfo(this.userInfo)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('setUserInfoSuc'),
                  type: 'success',
                  duration: 1500
                })
                this.userInfoFlag = false
                this.initUserInfo()
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
            })
        } else {
          this.$message({
            message: this.$t('passwordValFail'),
            type: 'warning',
            duration: 1500
          })
        }
      })
    },
    userInfoCancel() {
      this.userInfoFlag = false
    },
    linkToModel(item) {
      this.$router.push({
        path: '/model',
        query: {
          id: item.id
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.right-container {
  display: flex;
  height: 100%;
  align-items: center;
  button.upload {
    padding: 0 15px;
    height: 30px;
    line-height: 25px;
    background-color: transparent;
    border: 2px solid #fff;
    border-radius: 4px;
    color: #fff;
    margin-right: 1.25rem;
    cursor: pointer;
  }
  button:active {
    transform: translateY(1px);
  }
  .user {
    width: 60px;
    // margin-right: 2.083rem;
    a.user-logo {
      display: block;
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      font-size: 22px;
      border-radius: 50%;
      border: 1px solid #fff;
      background-color: rgba(255, 255, 255, .3);
      color: #fff;
    }
  }
}

// 内容区
.goods-container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 2.0833rem;
  background-color: #fcfcfc;
  // 修改筛选区域默认样式
  .el-card.filter:deep .el-card__body {
    padding: 0;
  }
  // 筛选区域容器
  .el-card .filter-container {
    padding: 1.302rem 1.0416rem;
    display: flex;
    justify-content: space-between;
    // 左边筛选条件部分
    .el-form {
      display: flex;
      align-items: center;
      .el-form-item {
        margin: 0;
        width: 250px;
      }
      // 修改label字体默认样式
      .el-form-item:deep label.el-form-item__label {
        font-weight: 700;
      }
      .el-form-item:deep .el-input__inner:focus {
        box-shadow: 0 0 0 1px #4943F7 inset!important;
      }
    }
    // 右边按钮部分
    .btn-group {
      display: flex;
      height: 32px;
      button {
        height: 100%;
        padding: 0 0.8rem;
        border-radius: 4px;
        cursor: pointer;
      }
      button:active {
        transform: translateY(1px);
      }
      .btn-confirm {
        background: #4943F7;
        border: 0;
        color: #fff;
        margin-right: 1.302rem;
      }
      .btn-reset {
        border: 2px solid #bfbfbf;
        color: #9c9c9c;
        background-color: #fff;
      }
    }
  }
  // 数据列表部分
  .table-container {
    margin-top: 2rem;
    min-height: 300px;
    position: relative;
    padding: 1.0416rem;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    .el-table {
      margin-bottom: 40px;
    }
    .pagination-container {
      position: absolute;
      bottom: 10px;
      right: 10px;
    }
  }
}

@media screen and (max-width: 1195px) {
  .el-card .filter-container {
    flex-direction: column;
    align-items: center;
    .el-form {
      flex-wrap: wrap;
      .el-form-item {
        width: 50%!important;
        margin-top: 10px!important;
      }
      .el-form-item:deep .el-input {
        width: 60%!important;
      }
    }
    
    .btn-group {
      margin-top: 10px;
      display: flex;
      button {
        flex: 1;
        width: 50%;
      }
    }
  }
}

// 修改表格表头默认颜色
.table-container:deep .el-table__header-wrapper table thead th {
  background-color: #F6F5FF;
}
.table-container:deep .el-table__row .el-button--text {
  color: #4943F7;
}

// 修改弹框默认样式
  // 弹框头部
.goods-container:deep .el-dialog__header {
  border-bottom: 1px solid #ccc;
  margin-right: 0;
}
  // 弹框底部
.goods-container:deep .el-dialog__footer {
  border-top: 1px solid #ccc;
  button {
    line-height: 30px;
    padding: 0 20px;
    background-color: #fff;
    border: 1px solid #bfbfbf;
    border-radius: 4px;
    cursor: pointer;
  }
  button:active {
    transform: translateY(1px);
  }
  .footer-cancel {
    margin-right: 10px;
  }
  .footer-confirm {
    background-color: #4943F7;
    color: #fff;
    border: 0;
  }
}
  // 弹框内表单
.goods-container:deep .el-input__inner:focus {
  box-shadow: 0 0 0 1px #4943F7 inset;
}
  
.el-form-item-upload:deep .el-form-item__content {
  margin-left: 0!important;
}
  // 弹框上传表单块
.upload-container {
  width: 100%;
  .upload-title {
    padding: 20px 0;
  }
}
.upload-container:deep .el-upload {
  width: 100%;
  display: block;
  // el-upload里面自己的盒子块
  .upload-group {
    width: 100%;
    position: relative;
    // 模拟输入框
    .upload-file-box {
      display: inline-block;
      box-sizing: border-box;
      width: 100%;
      height: 32px;
      padding-left: 11px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    // 选择文件按钮
    .upload-btn {
      position: absolute;
      right: -1px;
      top: 0;
      height: 32px;
      background-color: #4943F7;
      color: #fff;
      border: 0;
      border-radius: 2px;
      cursor: pointer;
    }
  }
}
  
</style>