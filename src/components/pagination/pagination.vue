<template>
  <div class="pagination">
    <el-select v-model="pageSize" placeholder="" @change="sizechange">
      <el-option
        v-for="item in options"
        :key="item.size"
        size="mini"
        :label="item.label"
        :value="item.size"
      />
    </el-select>
    <button size="mini" class="btn-arrow iconfont icon-youjiantou1" @click="prev"></button>
    <span class="show-text">{{ pageCount }}</span>
    <button size="mini" class="btn-arrow iconfont icon-youjiantou" @click="next"></button>
  </div>
</template>
<script>
import * as status from '@/utils/global'
export default {
  name: 'Pagination',
  props: {
    pageCount: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      pageSize: status.size,
      options: [
        {
          size: 5,
          label: `5${this.$t('pageSizeLabel')}`
        },
        {
          size: 10,
          label: `10${this.$t('pageSizeLabel')}`
        },
        {
          size: 15,
          label: `15${this.$t('pageSizeLabel')}`
        },
        {
          size: 20,
          label: `20${this.$t('pageSizeLabel')}`
        }
      ]

    }
  },
  methods: {
    next() {
      this.$emit('next')
    },
    prev() {
      this.$emit('prev')
    },
    sizechange() {
      this.$emit('selectchange', this.pageSize)
    }
  }
}
</script>
<style scoped>
.el-select {
  width: 100px;
  height: 29px;
  line-height: 29px;
}

.show-text {
  display: inline-block;
  width: 28px;
  height: 28px;
  background: #4943F7;
  color: #fff;
  text-align: center;
  font-size: 14px;
  line-height: 28px;
  border-radius: 3px;
}

.btn-arrow {
  display: inline-block;
  width: 32px;
  height: 32px;
  margin: 0 5px;
  background-color: #fff;
  color: #C0C4CC;
  font-size: 14px;
  line-height: 28px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 2px;
  cursor: pointer;
}
</style>
