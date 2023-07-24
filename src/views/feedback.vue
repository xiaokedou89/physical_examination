<template>
  <!-- 导航栏 -->
  <navbar>
    <template v-slot:right>
      <div class="right">
        <button class="upload" @click="addFeed">{{$t('add')}}</button>
        <user @showPassword="showPassword" @showUserInfo="showUserInfo" />
      </div>
    </template>
  </navbar>
  <!-- 内容主体 -->
  <div class="feedback-container">
    <!-- 筛选部分 -->
    <!-- <el-card class="filter">
      <div class="filter-container">
        <el-form ref="filterForm" :model="filter" label-width="80px">
          <el-form-item label="上传时间:">
            <el-date-picker
              v-model="time"
              type="date"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="反馈结果:">
            <el-select v-model="status" placeholder="">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="处理状态:">
            <el-select v-model="status" placeholder="">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="btn-group">
          <button class="btn-confirm">查询</button>
          <button class="btn-reset">重置</button>
        </div>
      </div>
    </el-card> -->

    <!-- 数据列表部分 -->
    <div class="table-container">
      <h3>{{$t('feedbackList')}}</h3>
      <el-table v-loading="loading" :data="list">
        <el-table-column align="center" :label="$t('feedbackTime')">
          <template #default="scope">
            {{ getTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('patientName')">
          <template #default="scope">
            {{ scope.row.order.patientName }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('diagnoseReportNo')">
          <template #default="scope">
            {{ scope.row.order.diagnoseReportNo }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('orderStatus')">
          <template #default="scope">
            {{ getOrderStatus(scope.row.order.status) }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('answer')">
          <template #default="scope">
            <el-button v-if="scope.row.answer" type="text" @click="showAnswer(scope.row)">{{$t('check')}}</el-button>
            <span v-else>{{$t('noAnswer')}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('action')">
          <template #default="scope">
            <el-button type="text" @click="setFeed(scope.row)">{{$t('set')}}</el-button>
            <el-button :disabled="scope.row.order.report === null && !scope.row.order.report" :loading="scope.row.downloading" type="text" @click="download(scope.row)">{{$t('download')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange"></pagination>
      </div>
    </div>
    <!-- 反馈弹框 -->
    <el-dialog :title="$t('feedback')" v-model="feedFlag" @opened="feedOpened" width="40%">
      <el-form ref="feedForm" :model="feedForm" label-width="80px" label-position="left"></el-form>
      <div ref="wangEditor" id="w-editor" class="editor-container" style="text-align: left">
      </div>
      <template #footer>
        <button class="footer-cancel" @click="feedFlag = false">{{$t('cancel')}}</button>
        <button class="footer-confirm" @click="feedConfirm">{{$t('confirm')}}</button>
      </template>
    </el-dialog>
    <!-- answer弹框 -->
    <el-dialog :title="$t('answerDiaTitle')" v-model="answerFlag" width="40%">
      <div class="answer-container" v-html="answerObj.answer"></div>
    </el-dialog>
    <!-- 修改密码弹框 -->
    <el-dialog :title="$t('setPasswordTitle')" v-model="passwordFlag" v-if="passwordFlag" width="40%">
      <el-form ref="passwordForm" :rules="rules" :model="passwordObj" label-width="80px" label-position="left">
        <el-form-item prop="oldPassword" :label="getLabel($t('oldPassword'))">
          <el-input v-model="passwordObj.oldPassword" :placeholder="$t('oldPasswordPlace')" autocomplete="on" show-password />
        </el-form-item>
        <el-form-item prop="newPassword" :label="getLabel($t('newPassword'))">
          <el-input v-model="passwordObj.newPassword" :placeholder="$t('newPasswordPlace')" autocomplete="on" show-password />
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
import * as global from '../utils/global.js'
import * as orderApi from '@/api/orders.js'
import * as api from '@/api/feed.js'
import * as userApi from '@/api/user.js'
import * as rule from '@/utils/rules.js'
import navbar from '../components/nav/navbar.vue'
import pagination from '../components/pagination/pagination.vue'
import user from '../components/user/user.vue'
import wangEditor from 'wangeditor'
import i18next from 'i18next'
import moment from 'moment'
import { getToken } from '@/utils/auth.js'
import { reactive } from 'vue'

const defaultParams = {
  sortMode: 'DESC',
  pkId: 0,
  size: global.size
}

const defaultFeed = {
  id: null,
  flag: false,
  advice: '',
  answer: null,
  createTime: null,
  examinationOrderId: null
}

const defaultAnswer = {
  answer: ''
}

const defaultPassword = {
  oldPassword: '',
  newPassword: ''
}

let defaultUserInfo = {
  name: '',
  organization: '',
  phone: '',
  email: ''
}

const rules = {
  oldPassword: rule.requiredRule,
  newPassword: rule.passwordRule,
  name: rule.unnameRule,
  organization: rule.unnameRule,
  phone: rule.unphoneRule,
  email: rule.emailRules
}

export default {
  name: 'feedback',
  components: {
    navbar,
    user,
    pagination,
  },
  data() {
    return {
      rules,
      baseUrl: global.network.baseURL,
      // 反馈弹框判断是添加还是修改
      isSet: false,
      // 订单路由跳转保存的id
      orderId: null,
      // 拉取的订单对象
      order: null,
      // 主列表保存的最小id
      minId: 0,
      // 最大id
      maxId: 0,
      // 列表加载开关
      loading: false,
      // 分页防抖
      flag: false,
      // 获取列表传参
      params: Object.assign({}, defaultParams),
      pageCount: 1,
      // 主列表数据
      list: [],
      // 富文本编辑器实例对象
      editor: null,
      // 反馈弹框开关
      feedFlag: false,
      // 反馈弹框绑定对象
      feedForm: Object.assign({}, defaultFeed),
      // 添加反馈保存对象
      feedObj: Object.assign({}, defaultFeed),
      // 修改反馈保存对象
      feedSaveNode: {},
      // answer弹框开关
      answerFlag: false,
      // answer弹框绑定对象
      answerObj: Object.assign({}, defaultAnswer),
      // 修改密码弹框开关
      passwordFlag: false,
      passwordObj: Object.assign({}, defaultPassword),
      userInfoFlag: false,
      userInfo: Object.assign({}, defaultUserInfo),
      filter: {},
      status: '',
      time: '',
      options: []
    }
  },
  created() {
    this.initUserInfo()
    this.orderId = this.$route.query.orderId
    this.initOrder()
      .then(() => {
        this.initList(this.params)
      })
      .catch(() => {
        this.$message({
          message: this.$t('initOrderFail'),
          type: 'error',
          duration: 1500
        })
        this.$router.go(-1)
      })
    this.feedForm.examinationOrderId = this.orderId
    this.feedObj.examinationOrderId = this.orderId
    defaultFeed.examinationOrderId = this.orderId
  },
  computed: {
    getTime() {
      return function (time) {
        return moment(time).format('YYYY/MM/D HH:mm')
      }
    },
    getOrderStatus() {
      return global.orderStatus
    },
    getLabel() {
      return function (label) {
        return `${label}：`
      }
    }
  },
  watch: {
    feedFlag(val) {
      if (!val && !this.isSet) {
        this.feedObj.advice = this.editor.txt.html()
      } 
    }
  },
  methods: {
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
    initOrder() {
      return new Promise((resolve, reject) => {
        orderApi.getOrder(this.orderId)
          .then(res => {
            if (res.code === 20000) {
              this.order = res.data
              resolve()
            } else if (res.code === 20004) {
              reject()
            }
          })
          .catch(err => {
            reject(err)
          })
      }) 
    },
    initList(params) {  
      this.loading = true
      api.getFeeds(this.orderId, params)
        .then(res => {
          if (res.code === 20000) {
            for (const [index, item] of res.data.entries()) {
              item.flag = false
              item.downloading = false
              item.order = this.order
              reactive(item)
            }
            this.flag = false
            this.list = res.data
            this.sortList()
            this.loading = false
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
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
    // 排序列表
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
    // 点击下一页
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
    // 点击上一页
    prevPage() {
      if (!this.flag) {
        this.flag = true
        this.pageCount--
        this.params.sortMode = 'ASC'
        this.params.pkId = this.maxId
        this.initList(this.params)
      } else {
        return 
      }
    },
    // 显示条数改变
    pageSizeChange(e) {
      this.params.sortMode = 'DESC'
      this.params.size = e
      this.params.pkId = 0
      this.pageCount = 1
      this.initList(this.params)
    },
    // 添加反馈
    addFeed() {
      this.isSet = false
      this.feedForm = Object.assign({}, this.feedObj)
      this.feedFlag = true
    },
    setFeed(item) {
      this.isSet = true
      this.feedForm = Object.assign({}, item)
      this.feedSaveNode = item
      this.feedFlag = true
    },
    // 反馈弹框打开回调
    feedOpened() {
      this.initEditor()
    },
    getLang() {
      let lang = 'zh'
      if (window.sessionStorage.getItem('lang')) {
        lang = window.sessionStorage.getItem('lang')
      }
      return lang
    },
    initEditor() {
      const that = this
      let uploadHooks,
          menus,
          editorConfig;
      if (this.editor === null) {
        // 上传钩子对象
        uploadHooks = {
          // 自定义上传
          customInsert(insert, result) {
            let url = global.network.globalURL + global.network.getFile('common') + result.data.filename
            insert(url)
          }
        }
        menus = [
          'head',  // 标题
          'bold',  // 粗体
          'fontSize',  // 字号
          'fontName',  // 字体
          'italic',  // 斜体
          'underline',  // 下划线
          'strikeThrough',  // 删除线
          'foreColor',  // 文字颜色
          'backColor',  // 背景颜色
          'link',  // 插入链接
          'list',  // 列表
          'justify',  // 对齐方式
          'quote',  // 引用
          'emoticon',  // 表情
          'image',  // 插入图片
          'video',  // 插入视频
          'table',  // 表格
          'code',  // 插入代码
          'undo',  // 撤销
          'redo', // 重复
          'indent',//分割线
          'lineHeight',//行高
          'splitLine',//全屏
        ]
        // 编辑器配置对象
        editorConfig = {
          height: 350,
          menus,
          onchangeTimeout: 1000,
          uploadImgServer: global.network.globalURL + global.network.fileUploadURL + 'common', 
          uploadImgHeaders: {
            'authorization': getToken()
          },
          uploadFileName: 'file',
          showLinkImg: false,
          uploadImgMaxLength: 1,
          uploadImgMaxSize: global.network.staticMaxSize,
          uploadImgTimeout: global.network.staticTimeout,
          uploadVideoServer: global.network.globalURL + global.network.fileUploadURL + 'common',
          uploadVideoMaxSize: global.network.staticMaxSize,
          uploadVideoName: 'file',
          uploadVideoHeaders: {
            'authorization': getToken()
          },
          uploadVideoTimeout: global.network.staticTimeout,
          onchange: that.editorChange,
          uploadImgHooks: uploadHooks,
          uploadVideoHooks: uploadHooks
        }
        if (this.getLang() === 'en') {
          editorConfig.lang = this.getLang()
        }
        this.editor = new wangEditor(this.$refs.wangEditor)
        this.editor.i18next = i18next     
        this.editor.config = {...this.editor.config, ...editorConfig}
        this.editor.create()
        this.editor.txt.html(this.feedForm.advice)
        
      } else {
        this.editor.txt.html(this.feedForm.advice)
      }
    },
    // 富文本
    editorChange() {
      this.feedForm.advice = this.editor.txt.html()
      console.log('editor change')
    },
    // 点击反馈弹框确定
    feedConfirm() {
      if (this.feedForm.flag) {
        return
      }
      this.feedForm.flag = true
      let apiFn
      if (this.editor.txt.html()) {
        apiFn = this.isSet ? api.setFeed : api.addFeed
        apiFn(this.feedForm)
          .then(res => {
            if (res.code === 20000) {
              this.feedForm.flag = false
              !this.isSet && (this.feedObj = Object.assign({}, defaultFeed))
              this.initList(this.params)
              this.feedFlag = false
            }
          })
          .catch(err => {
            this.feedForm.flag = false
            this.$message({
              message: err,
              type: 'error',
              duration: 1500
            })
          })
      } else {
        this.feedForm.flag = false
        this.$message({
          message: this.$t('noFeedbackWarn'),
          type: 'warning',
          duration: 1500
        })
      }
    },
    // 点击处理状态查看打开answer弹框
    showAnswer(item) {
      this.answerObj = Object.assign({}, item)
      this.answerFlag = true
    },
    download(item) {
      const that = this
      this.$message({
        message: this.$t('downloading'),
        type: 'success',
        duration: 1500
      })
      item.downloading = true
      // let url = `${global.network.globalURL}${global.network.getFile('common')}${item.report}`,
      // let url = `${global.network.baseURL}${global.network.getFile('common')}${item.order.report}`,
      let url = `${global.network.globalURL}${global.network.getFile('common')}${item.order.report}`,
          xhr = new XMLHttpRequest()
      xhr.open('get',url, true)
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
          link.download = item.order.report
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
    // 点击修改密码显示弹框
    showPassword() {
      this.passwordObj = Object.assign({}, defaultPassword)
      this.passwordFlag = true
    },
    // 修改密码弹框确认
    passwordConfirm() {
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
    }
  }
}
</script>
<style lang="scss" scoped>
.right {
  display: flex;
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
  
}

// 内容区
.feedback-container {
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
        padding: 0 12px;
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
// 修改表格表头默认颜色
.table-container:deep .el-table__header-wrapper table thead th {
  background-color: #F6F5FF;
}
.table-container:deep .el-table__row .el-button--text {
  color: #4943F7;
}

// 修改弹框默认样式
  // 弹框头部
.feedback-container:deep .el-dialog__header {
  border-bottom: 1px solid #ccc;
  margin-right: 0;
}
  // 弹框底部
.feedback-container:deep .el-dialog__footer {
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
.feedback-container:deep .el-input__inner:focus {
  box-shadow: 0 0 0 1px #4943F7 inset;
}

.feedback-container:deep .el-textarea__inner {
  resize: none;
}

.feedback-container:deep .el-textarea__inner:focus {
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
  // 鼠标悬浮上传框样式
  .upload-group:hover .upload-file-box {
    box-shadow: 0 0 0 1px #a8abb2 inset;
    border: 0;
  }
  // 鼠标点击上传框样式
  .upload-group:active .upload-file-box {
    box-shadow: 0 0 0 1px #4943F7 inset;
    border: 0;
  }
}

.answer-container {
  border: 1px solid #ccc;
  padding: 10px;
}
</style>