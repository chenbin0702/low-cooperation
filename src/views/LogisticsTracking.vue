<template>
  <div class="logistics-tracking">
    <!-- 搜索过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="物流单号">
          <el-input v-model="searchForm.trackingNo" placeholder="请输入物流单号" clearable />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="物流状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="运输中" value="in_transit" />
            <el-option label="已签收" value="delivered" />
            <el-option label="异常" value="exception" />
          </el-select>
        </el-form-item>
        <el-form-item label="发货时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 物流列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>物流跟踪</h2>
        </div>
      </template>

      <el-table :data="logisticsList" v-loading="loading" style="width: 100%">
        <el-table-column prop="trackingNo" label="物流单号" width="180" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="company" label="物流公司" width="120" />
        <el-table-column prop="status" label="物流状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="latestInfo" label="最新物流信息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" width="180" sortable />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
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

    <!-- 物流详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="物流详情"
      width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="物流单号">{{ currentDetail.trackingNo }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ currentDetail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="物流公司">{{ currentDetail.company }}</el-descriptions-item>
        <el-descriptions-item label="物流状态">
          <el-tag :type="getStatusType(currentDetail.status)">
            {{ getStatusText(currentDetail.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div class="logistics-timeline">
        <h4>物流轨迹</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(track, index) in currentDetail.tracks"
            :key="index"
            :type="getTimelineItemType(track.status)"
            :timestamp="track.time">
            {{ track.content }}
          </el-timeline-item>
        </el-timeline>
      </div>

      <div v-if="currentDetail.status === 'delivered'" class="delivery-info">
        <h4>签收信息</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="签收人">{{ currentDetail.signInfo?.signer }}</el-descriptions-item>
          <el-descriptions-item label="签收时间">{{ currentDetail.signInfo?.time }}</el-descriptions-item>
          <el-descriptions-item label="签收状态">
            <el-tag type="success">已签收</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 状态管理
const loading = ref(false)
const detailDialogVisible = ref(false)
const currentDetail = ref({})

// 搜索表单
const searchForm = reactive({
  trackingNo: '',
  orderNo: '',
  status: '',
  dateRange: []
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 物流列表数据
const logisticsList = ref([])

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    in_transit: 'warning',
    delivered: 'success',
    exception: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    in_transit: '运输中',
    delivered: '已签收',
    exception: '异常'
  }
  return statusMap[status] || status
}

// 获取时间线项目类型
const getTimelineItemType = (status) => {
  const typeMap = {
    in_transit: 'warning',
    delivered: 'success',
    exception: 'danger'
  }
  return typeMap[status] || 'primary'
}

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

// 查看详情
const viewDetail = (row) => {
  currentDetail.value = {
    ...row,
    tracks: [
      {
        time: '2024-01-15 14:30:00',
        content: '已签收，签收人：张三',
        status: 'delivered'
      },
      {
        time: '2024-01-15 09:30:00',
        content: '快件已到达【北京朝阳区营业点】',
        status: 'in_transit'
      },
      {
        time: '2024-01-14 20:30:00',
        content: '快件已从【上海转运中心】发出',
        status: 'in_transit'
      }
    ],
    signInfo: {
      signer: '张三',
      time: '2024-01-15 14:30:00'
    }
  }
  detailDialogVisible.value = true
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 实现实际的数据加载逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    logisticsList.value = [
      {
        trackingNo: 'SF1234567890',
        orderNo: 'ORD202401150001',
        company: '顺丰快递',
        status: 'delivered',
        latestInfo: '已签收，签收人：张三',
        updateTime: '2024-01-15 14:30:00'
      },
      {
        trackingNo: 'YT9876543210',
        orderNo: 'ORD202401140001',
        company: '圆通快递',
        status: 'in_transit',
        latestInfo: '快件已到达【北京朝阳区营业点】',
        updateTime: '2024-01-15 09:30:00'
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
.logistics-tracking {
  padding: 20px;
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

.logistics-timeline {
  margin-top: 20px;
}

.logistics-timeline h4,
.delivery-info h4 {
  margin: 0 0 16px;
  color: #303133;
  font-size: 16px;
}

.delivery-info {
  margin-top: 20px;
}

@media screen and (max-width: 768px) {
  .logistics-tracking {
    padding: 10px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
  }
}
</style>