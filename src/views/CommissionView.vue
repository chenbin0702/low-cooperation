<template>
  <div class="commission-view">
    <!-- 佣金统计卡片 -->
    <el-row :gutter="20" class="statistics-section">
      <el-col :span="8">
        <el-card class="statistic-card">
          <div class="statistic-value">¥{{ statistics.totalCommission }}</div>
          <div class="statistic-label">累计佣金总额</div>
          <div class="statistic-trend">
            较上月 
            <span :class="statistics.monthGrowth >= 0 ? 'up' : 'down'">
              {{ statistics.monthGrowth >= 0 ? '+' : '' }}{{ statistics.monthGrowth }}%
            </span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="statistic-card">
          <div class="statistic-value">¥{{ statistics.monthCommission }}</div>
          <div class="statistic-label">本月佣金</div>
          <div class="statistic-trend">
            已完成 {{ statistics.monthProgress }}%
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="statistic-card">
          <div class="statistic-value">¥{{ statistics.pendingCommission }}</div>
          <div class="statistic-label">待结算佣金</div>
          <div class="statistic-count">
            {{ statistics.pendingCount }} 笔待结算
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="产品类型">
          <el-select v-model="searchForm.productType" placeholder="请选择" clearable>
            <el-option label="无人机" value="drone" />
            <el-option label="配件" value="parts" />
            <el-option label="服务" value="service" />
          </el-select>
        </el-form-item>
        <el-form-item label="结算状态">
          <el-select v-model="searchForm.settleStatus" placeholder="请选择" clearable>
            <el-option label="待结算" value="pending" />
            <el-option label="已结算" value="settled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 佣金明细列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>佣金明细</h2>
          <el-button type="primary" @click="exportCommission">导出明细</el-button>
        </div>
      </template>

      <el-table :data="commissionList" v-loading="loading" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="orderTime" label="订单时间" width="180" sortable />
        <el-table-column prop="productType" label="产品类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.productType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="订单金额" width="150">
          <template #default="{ row }">
            ¥{{ row.orderAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="commissionRate" label="佣金比例" width="120">
          <template #default="{ row }">
            {{ row.commissionRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="commissionAmount" label="佣金金额" width="150">
          <template #default="{ row }">
            ¥{{ row.commissionAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="settleStatus" label="结算状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.settleStatus === 'settled' ? 'success' : 'warning'">
              {{ row.settleStatus === 'settled' ? '已结算' : '待结算' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="settleTime" label="结算时间" width="180" />
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 统计数据
const statistics = reactive({
  totalCommission: '128,560.00',
  monthGrowth: 12.5,
  monthCommission: '15,280.00',
  monthProgress: 85,
  pendingCommission: '3,150.00',
  pendingCount: 8
})

// 搜索表单
const searchForm = reactive({
  dateRange: [],
  orderNo: '',
  productType: '',
  settleStatus: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 佣金列表数据
const commissionList = ref([])
const loading = ref(false)

// 搜索方法
const handleSearch = () => {
  loadData()
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.dateRange = []
  handleSearch()
}

// 分页方法
const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadData()
}

// 导出佣金明细
const exportCommission = () => {
  ElMessage.success('佣金明细导出成功')
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 实现实际的数据加载逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    commissionList.value = [
      {
        orderNo: 'ORD202401150001',
        orderTime: '2024-01-15 14:30:00',
        productType: '无人机',
        orderAmount: 29999.00,
        commissionRate: 15,
        commissionAmount: 4499.85,
        settleStatus: 'pending',
        settleTime: '-'
      },
      {
        orderNo: 'ORD202401140001',
        orderTime: '2024-01-14 10:00:00',
        productType: '配件',
        orderAmount: 1999.00,
        commissionRate: 10,
        commissionAmount: 199.90,
        settleStatus: 'settled',
        settleTime: '2024-01-15 10:00:00'
      }
    ]
    pagination.total = 20
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.commission-view {
  padding: 20px;
}

.statistics-section {
  margin-bottom: 20px;
}

.statistic-card {
  text-align: center;
  padding: 20px;
}

.statistic-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.statistic-label {
  color: #606266;
  margin-bottom: 8px;
}

.statistic-trend,
.statistic-count {
  font-size: 14px;
  color: #909399;
}

.statistic-trend .up {
  color: #67c23a;
}

.statistic-trend .down {
  color: #f56c6c;
}

.filter-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media screen and (max-width: 768px) {
  .commission-view {
    padding: 10px;
  }
  
  .statistics-section {
    margin-bottom: 10px;
  }
  
  .statistic-card {
    margin-bottom: 10px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
  }
}
</style>