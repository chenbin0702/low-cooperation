<template>
  <el-menu
    :default-active="activeIndex"
    class="main-navigation"
    :collapse="isCollapse"
    @select="handleSelect"
    :collapse-transition="false"
    mode="vertical">
    
    <el-sub-menu index="basic-info">
      <template #title>
        <el-icon><InfoFilled /></el-icon>
        <span>基本信息</span>
      </template>
      <el-menu-item index="/profile-management">资料管理</el-menu-item>
      <el-menu-item index="/agreement-management">协议管理</el-menu-item>
      <el-menu-item index="/agreement-view">协议查看</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="business-management">
      <template #title>
        <el-icon><Operation /></el-icon>
        <span>业务管理</span>
      </template>
      <el-sub-menu index="customer-development">
        <template #title>客户开发与维护</template>
        <el-menu-item index="/customer-info">客户信息收集</el-menu-item>
        <el-menu-item index="/customer-follow-up">客户跟进记录</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="cooperation-negotiation">
        <template #title>合作洽谈管理</template>
        <el-menu-item index="/negotiation-records">洽谈记录</el-menu-item>
        <el-menu-item index="/agreement-draft">协议起草与审核</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>

    <el-sub-menu index="order-management">
      <template #title>
        <el-icon><Document /></el-icon>
        <span>订单管理</span>
      </template>
      <el-sub-menu index="order-tracking">
        <template #title>订单提交与跟踪</template>
        <el-menu-item index="/order-create">订单创建</el-menu-item>
        <el-menu-item index="/order-track">订单跟踪</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>

    <el-sub-menu index="commission-management">
      <template #title>
        <el-icon><Money /></el-icon>
        <span>佣金与收入管理</span>
      </template>
      <el-menu-item index="/commission-view">佣金计算与查看</el-menu-item>
      <el-menu-item index="/income-withdraw">收入提现与结算</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="inventory-logistics">
      <template #title>
        <el-icon><Box /></el-icon>
        <span>库存与物流</span>
      </template>
      <el-sub-menu index="inventory-management">
        <template #title>库存管理</template>
        <el-menu-item index="/inventory-query">库存查询</el-menu-item>
        <el-menu-item index="/inventory-replenishment">补货申请</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="logistics-management">
        <template #title>物流管理</template>
        <el-menu-item index="/logistics-tracking">物流跟踪</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>

    <el-sub-menu index="market-analysis">
      <template #title>
        <el-icon><TrendCharts /></el-icon>
        <span>市场分析与推广</span>
      </template>
      <el-sub-menu index="market-research">
        <template #title>市场信息收集与分析</template>
        <el-menu-item index="/industry-trends">行业动态</el-menu-item>
        <el-menu-item index="/competitor-analysis">竞争对手分析</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="promotion-management">
        <template #title>推广活动管理</template>
        <el-menu-item index="/activity-planning">活动策划与执行</el-menu-item>
        <el-menu-item index="/activity-evaluation">活动效果评估</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { InfoFilled, Operation, Document, Box, Money, TrendCharts } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

// 计算当前激活的菜单项
const activeIndex = computed(() => route.path)

// 处理菜单选择
const handleSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.main-navigation {
  height: 100vh;
  border-right: solid 1px var(--el-menu-border-color);
}

.main-navigation:not(.el-menu--collapse) {
  width: 200px;
}

@media screen and (max-width: 768px) {
  .main-navigation {
    width: auto;
  }
}
</style>