<template>
  <div class="navbar">
    <slot name="left">
      <a class="left" href="/">
        <span class="logo"></span>
        <h1 class="title">{{$t('logoTitle')}}</h1>
      </a>
    </slot>
    <div class="center">
      <slot name="center"></slot>
    </div>
    <div class="right">
      <slot name="right">
        <div class="user">
          <a class="iconfont icon-yonghu user-logo" href="#"></a>
        </div>
      </slot>
      <div class="lang-container">
        <span class="lang-label">{{$t('language')}}</span>
        <el-select v-model="langType" @change="langChange">
          <el-option v-for="(item, index) in langTypes" :key="index" :label="item.name" :value="item.type"></el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>
<script>
import i18n from '@/assets/languages/i18n.js'

function getI18nTypes(i18n) {
  const i18nTypes = []
  for (let key in i18n.global.messages.value) {
    let obj = {}
    obj.type = key
    obj.name = i18n.global.messages.value[key].langType
    i18nTypes.push(obj)
  }
  return i18nTypes
}

export default {
  name: 'navbar',
  created() {
    this.langTypes = getI18nTypes(i18n)
  },
  data() {
    return {
      langType: sessionStorage.getItem('lang') || 'zh',
      langTypes: []
    }
  },
  methods: {
    langChange(e) {
      sessionStorage.setItem('lang', e)
      window.location.reload()
    }
  }
}
</script>
<style lang="scss" scoped>
  .navbar {
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: #4943F7;
    display: flex;
    justify-content: space-between;
    .left {
      display: block;
      height: 100%;
      margin-left: 2.083rem;
      span.logo {
        display: inline-block;
        height: 100%;
        width: 60px;
        background: url('@/assets/images/logo.png') no-repeat;
        background-size: 60px;
      }
      h1.title {
        display: inline-block;
        height: 100%;
        line-height: 60px;
        color: #fff;
        font-size: 16px;
        vertical-align: top;
      }
    }
    .center {
      height: 100%;
    }
    .right {
      display: flex;
      .user {
        width: 60px;
        margin-right: 2.083rem;
        a.user-logo {
          margin-top: 10px;
          display: block;
          width: 40px;
          height: 40px;
          line-height: 40px;
          text-align: center;
          font-size: 22px;
          border-radius: 50%;
          border: 1px solid #fff;
          background-color: rgba(255, 255, 255, .3);
          color: #fff;
        }
      }
      .lang-container {
        display: flex;
        align-items: center;
        margin-right: 10px;
        span.lang-label {
          color: #fff;
          font-size: 14px;
          margin-right: 5px;
        }
        .el-select {
          width: 80px;
        }
        .el-select:deep .el-input__inner {
          background: #fff;
          color: #4943F7;
          border: 2px solid #fff;
        }
      }
    }
    
  }
</style>