<template>
  <!-- 用户模块 -->
  <el-dropdown>
    <div class="user">
      <span class="iconfont icon-yonghu user-logo"></span>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="showPassword">{{$t('setPassword')}}</el-dropdown-item>
        <el-dropdown-item @click="showUserInfo">{{$t('changeInfo')}}</el-dropdown-item>
        <el-dropdown-item @click="logout">{{$t('out')}}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script>
import * as sessions from '@/utils/auth.js'
export default {
  name: 'user',
  methods: {
    logout() {
      this.$store.dispatch('logout')
        .then(() => {
          this.$message({
            message: this.$t('logouted'),
            type: 'success',
            duration: 1500
          })
        })
        this.$router.replace('/login')
    },
    showPassword() {
      this.$emit('showPassword')
    },
    showUserInfo() {
      this.$emit('showUserInfo')
    }
  }
}
</script>
<style lang="scss" scoped>
.user {
  margin-right: 10px;
  width: 60px;
  // margin-right: 2.083rem;
  span.user-logo {
    display: block;
    margin: 0 auto;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-size: 22px;
    border-radius: 50%;
    border: 1px solid #fff;
    background-color: rgba(255, 255, 255, .3);
    color: #fff;
    cursor: pointer;
  }
}
</style>