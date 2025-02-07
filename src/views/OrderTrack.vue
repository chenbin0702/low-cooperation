<template>
  <div class="order-track">
    <!-- 搜索过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option
              v-for="status in orderStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
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

    <!-- 订单列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>订单跟踪</h2>
          <el-button type="primary" @click="toggleNotification">
            {{ notificationEnabled ? '关闭通知' : '开启通知' }}
          </el-button>
        </div>
      </template>

      <el-table :data="orderList" v-loading="loading" style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="createTime" label="下单时间" width="180" sortable />
        <el-table-column prop="type" label="订单类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getOrderTypeTag(row.type)">{{ getOrderTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button 
              v-if="row.status === 'delivered'"
              link 
              type="success" 
              @click="confirmReceipt(row)">
              确认收货
            </el-button>
            <el-button
              v-if="row.logistics"
              link
              type="primary"
              @click="showLogistics(row)">
              物流信息
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

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">
          <el-tag :type="getOrderTypeTag(currentOrder.type)">
            {{ getOrderTypeText(currentOrder.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusTag(currentOrder.status)">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ currentOrder.amount }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ currentOrder.paymentMethod }}</el-descriptions-item>
      </el-descriptions>

      <!-- 订单进度 -->
      <div class="progress-section">
        <h4>订单进度</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(progress, index) in currentOrder.progress"
            :key="index"
            :timestamp="progress.time"
            :type="progress.type">
            {{ progress.content }}
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 商品信息 -->
      <div class="items-section">
        <h4>商品信息</h4>
        <el-table :data="currentOrder.items" border>
          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="quantity" label="数量" width="120" />
          <el-table-column prop="price" label="单价" width="120">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="total" label="小计" width="120">
            <template #default="{ row }">¥{{ row.price * row.quantity }}</template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 收货信息 -->
      <div class="delivery-section">
        <h4>收货信息</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="收货人">{{ currentOrder.delivery?.contact }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.delivery?.phone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ currentOrder.delivery?.address }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 物流信息对话框 -->
    <el-dialog
      v-model="logisticsDialogVisible"
      title="物流信息"
      width="50%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="物流公司">{{ currentLogistics.company }}</el-descriptions-item>
        <el-descriptions-item label="物流单号">{{ currentLogistics.trackingNo }}</el-descriptions-item>
      </el-descriptions>

      <div class="logistics-timeline">
        <el-timeline>
          <el-timeline-item
            v-for="(track, index) in currentLogistics.tracks"
            :key="index"
            :timestamp="track.time">
            {{ track.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const loading = ref(false)
const detailDialogVisible = ref(false)
const logisticsDialogVisible = ref(false)
const notificationEnabled = ref(true)
const currentOrder = ref({})
const currentLogistics = ref({})

// 搜索表单
const searchForm = reactive({
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

// 订单列表数据
const orderList = ref([])

// 状态选项
const orderStatusOptions = [
  { label: '已提交', value: 'submitted' },
  { label: '已接单', value: 'accepted' },
  { label: '备货中', value: 'preparing' },
  { label: '已发货', value: 'delivered' },
  { label: '已完成', value: 'completed' }
]

// 订单类型标签
const getOrderTypeTag = (type) => {
  const typeMap = {
    product: '',
    rental: 'success',
    service: 'warning'
  }
  return typeMap[type] || ''
}

const getOrderTypeText = (type) => {
  const textMap = {
    product: '商品购买',
    rental: '设备租赁',
    service: '服务订单'
  }
  return textMap[type] || type
}

// 状态标签
const getStatusTag = (status) => {
  const statusMap = {
    submitted: 'info',
    accepted: 'warning',
    preparing: 'warning',
    delivered: 'success',
    completed: 'success'
  }
  return statusMap[status] || ''
}

const getStatusText = (status) => {
  const textMap = {
    submitted: '已提交',
    accepted: '已接单',
    preparing: '备货中',
    delivered: '已发货',
    completed: '已完成'
  }
  return textMap[status] || status
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

// 显示订单详情
const showDetail = (order) => {
  currentOrder.value = order
  detailDialogVisible.value = true
}

// 显示物流信息
const showLogistics = (order) => {
  // 模拟获取物流信息
  currentLogistics.value = {
    company: '示例物流',
    trackingNo: 'SF1234567890',
    tracks: [
      { time: '2024-01-15 14:30:00', content: '快件已签收，签收人：张三' },
      { time: '2024-01-15 09:30:00', content: '快件已到达【北京朝阳区营业点】' },
      { time: '2024-01-14 20:30:00', content: '快件已从【上海转运中心】发出' }
    ]
  }
  logisticsDialogVisible.value = true
}

// 确认收货
const confirmReceipt = (order) => {
  ElMessageBox.confirm(
    '确认已收到商品？',
    '确认收货',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    loading.value = true
    try {
      // TODO: 实现实际的确认收货逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success('确认收货成功')
      loadData()
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      loading.value = false
    }
  })
}

// 切换通知状态
const toggleNotification = () => {
  notificationEnabled.value = !notificationEnabled.value
  ElMessage.success(notificationEnabled.value ? '已开启通知' : '已关闭通知')
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 实现实际的数据加载逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    orderList.value = [
      {
        orderNo: 'ORD202401150001',
        createTime: '2024-01-15 14:30:00',
        type: 'product',
        status: 'delivered',
        amount: 29999,
        paymentMethod: '在线支付',
        progress: [
          { time: '2024-01-15 14:30:00', content: '商品已发货', type: 'success' },
          { time: '2024-01-14 10:00:00', content: '订单已确认', type: 'success' },
          { time: '2024-01-14 09:30:00', content: '订单已提交', type: 'success' }
        ],
        items: [
          { name: '无人机A型', quantity: 1, price: 29999 }
        ],
        delivery: {
          contact: '张三',
          phone: '13800138000',
          address: '上海市浦东新区XX路XX号'
        },
        logistics: true
      },
      {
        orderNo: 'ORD202401150002',
        createTime: '2024-01-15 10:00:00',
        type: 'rental',
        status: 'preparing',
        amount: 1999,
        paymentMethod: '在线支付',
        progress: [
          { time: '2024-01-15 10:00:00', content: '订单已确认', type: 'success' },
          { time: '2024-01-15 09:30:00', content: '订单已提交', type: 'success' }
        ],
        items: [
          { name: '专业航拍无人机', quantity: 1, price: 1999 }
        ],
        delivery: {
          contact: '李四',
          phone: '13900139000',
          address: '北京市朝阳区XX路XX号'
        }
      }
    ]
    pagination.total = 20
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 订单状态更新检查定时器
let statusCheckTimer = null

// 检查订单状态更新
const checkOrderStatus = async () => {
  if (!notificationEnabled.value) return
  
  try {
    // TODO: 实现实际的状态检查逻辑
    // 模拟发现新的状态更新
    ElMessage({
      message: '订单 ORD202401150001 已发货',
      type: 'success'
    })
  } catch (error) {
    console.error('检查订单状态失败:', error)
  }
}

// 生命周期钩子
onMounted(() => {
  loadData()
  // 设置定时检查订单状态
  statusCheckTimer = setInterval(checkOrderStatus, 30000) // 每30秒检查一次
})

onBeforeUnmount(() => {
  if (statusCheckTimer) {
    clearInterval(statusCheckTimer)
  }
})
</script>

<style scoped>
.order-track {
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

.progress-section,
.items-section,
.delivery-section {
  margin-top: 20px;
}

.progress-section h4,
.items-section h4,
.delivery-section h4 {
  margin-bottom: 16px;
  color: #303133;
  font-size: 16px;
}

.logistics-timeline {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
}

@media screen and (max-width: 768px) {
  .order-track {
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