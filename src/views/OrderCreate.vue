<template>
  <div class="order-create">
    <el-card class="order-card">
      <template #header>
        <div class="card-header">
          <h2>创建订单</h2>
          <el-tag v-if="orderStatus.isDraft" type="info">草稿已保存</el-tag>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="orderForm"
        :rules="rules"
        label-width="120px"
        @submit.prevent>
        
        <!-- 客户信息 -->
        <div class="form-section">
          <h3>客户信息</h3>
          <el-form-item label="客户名称" prop="customer.name">
            <el-select
              v-model="orderForm.customer.name"
              filterable
              placeholder="请选择客户"
              @change="handleCustomerSelect"
              style="width: 100%">
              <el-option
                v-for="customer in customerOptions"
                :key="customer.value"
                :label="customer.label"
                :value="customer.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="联系人" prop="customer.contact">
            <el-input v-model="orderForm.customer.contact" />
          </el-form-item>

          <el-form-item label="联系电话" prop="customer.phone">
            <el-input v-model="orderForm.customer.phone" />
          </el-form-item>

          <el-form-item label="收货地址" prop="customer.address">
            <el-input
              v-model="orderForm.customer.address"
              type="textarea"
              :rows="2"
            />
          </el-form-item>
        </div>

        <!-- 订单类型 -->
        <div class="form-section">
          <h3>订单类型</h3>
          <el-form-item label="订单类型" prop="orderType">
            <el-radio-group v-model="orderForm.orderType" @change="handleOrderTypeChange">
              <el-radio label="product">商品购买</el-radio>
              <el-radio label="rental">设备租赁</el-radio>
              <el-radio label="service">服务订单</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- 商品/服务选择 -->
        <div class="form-section">
          <h3>订单明细</h3>
          <div v-if="orderForm.orderType === 'product'" class="order-items">
            <div v-for="(item, index) in orderForm.items" :key="index" class="order-item">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item
                    :label="index === 0 ? '商品选择' : ''"
                    :prop="'items.' + index + '.productId'"
                    :rules="{ required: true, message: '请选择商品', trigger: 'change' }">
                    <el-select
                      v-model="item.productId"
                      placeholder="请选择商品"
                      @change="(val) => handleProductSelect(val, index)"
                      style="width: 100%">
                      <el-option
                        v-for="product in productOptions"
                        :key="product.id"
                        :label="product.name"
                        :value="product.id">
                        <span>{{ product.name }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">
                          库存: {{ product.stock }}
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item
                    :label="index === 0 ? '数量' : ''"
                    :prop="'items.' + index + '.quantity'"
                    :rules="[
                      { required: true, message: '请输入数量', trigger: 'blur' },
                      { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
                    ]">
                    <el-input-number
                      v-model="item.quantity"
                      :min="1"
                      :max="getMaxQuantity(item)"
                      @change="calculateItemTotal(index)"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item :label="index === 0 ? '单价' : ''">
                    <el-input v-model="item.price" disabled>
                      <template #append>元</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item :label="index === 0 ? '小计' : ''">
                    <el-input v-model="item.total" disabled>
                      <template #append>元</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="1" class="item-actions">
                  <el-button
                    v-if="index === orderForm.items.length - 1"
                    type="primary"
                    link
                    @click="addOrderItem">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-button
                    v-if="orderForm.items.length > 1"
                    type="danger"
                    link
                    @click="removeOrderItem(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </div>

          <div v-if="orderForm.orderType === 'rental'" class="rental-info">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="租赁设备" prop="rental.equipmentId">
                  <el-select
                    v-model="orderForm.rental.equipmentId"
                    placeholder="请选择设备"
                    @change="handleEquipmentSelect"
                    style="width: 100%">
                    <el-option
                      v-for="equipment in equipmentOptions"
                      :key="equipment.id"
                      :label="equipment.name"
                      :value="equipment.id">
                      <span>{{ equipment.name }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">
                        {{ equipment.available ? '可租赁' : '已租出' }}
                      </span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="租赁时间" prop="rental.duration">
                  <el-input-number
                    v-model="orderForm.rental.duration"
                    :min="1"
                    @change="calculateRentalFee"
                    style="width: 100%">
                    <template #append>天</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="租赁费用">
                  <el-input v-model="orderForm.rental.fee" disabled>
                    <template #append>元</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div v-if="orderForm.orderType === 'service'" class="service-info">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="服务项目" prop="service.serviceId">
                  <el-select
                    v-model="orderForm.service.serviceId"
                    placeholder="请选择服务"
                    @change="handleServiceSelect"
                    style="width: 100%">
                    <el-option
                      v-for="service in serviceOptions"
                      :key="service.id"
                      :label="service.name"
                      :value="service.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="服务费用">
                  <el-input v-model="orderForm.service.fee" disabled>
                    <template #append>元</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="服务要求" prop="service.requirements">
              <el-input
                v-model="orderForm.service.requirements"
                type="textarea"
                :rows="3"
                placeholder="请详细描述服务要求"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 交付信息 -->
        <div class="form-section">
          <h3>交付信息</h3>
          <el-form-item label="预计交付日期" prop="deliveryDate">
            <el-date-picker
              v-model="orderForm.deliveryDate"
              type="date"
              placeholder="选择日期"
              :disabled-date="disabledDate"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="备注说明" prop="remarks">
            <el-input
              v-model="orderForm.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注说明"
            />
          </el-form-item>
        </div>

        <!-- 订单金额 -->
        <div class="order-total">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="订单总额">
              <span class="total-amount">¥ {{ calculateOrderTotal() }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 表单操作 -->
        <div class="form-actions">
          <el-button type="primary" @click="submitOrder" :loading="submitting">
            提交订单
          </el-button>
          <el-button @click="saveDraft" :loading="saving">
            保存草稿
          </el-button>
          <el-button @click="resetForm" :disabled="submitting || saving">
            重置
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

// 表单引用
const formRef = ref(null)

// 状态管理
const submitting = ref(false)
const saving = ref(false)
const orderStatus = reactive({
  isDraft: false,
  lastSaved: null
})

// 模拟数据
const customerOptions = [
  { label: '示例客户1', value: 'customer1' },
  { label: '示例客户2', value: 'customer2' }
]

const productOptions = [
  { id: 1, name: '无人机A型', price: 29999, stock: 10 },
  { id: 2, name: '无人机B型', price: 39999, stock: 5 },
  { id: 3, name: '配件套装', price: 1999, stock: 50 }
]

const equipmentOptions = [
  { id: 1, name: '专业航拍无人机', dailyRate: 999, available: true },
  { id: 2, name: '测绘无人机', dailyRate: 1299, available: true },
  { id: 3, name: '植保无人机', dailyRate: 899, available: false }
]

const serviceOptions = [
  { id: 1, name: '航拍服务', price: 5000 },
  { id: 2, name: '测绘服务', price: 8000 },
  { id: 3, name: '培训服务', price: 3000 }
]

// 表单数据
const orderForm = reactive({
  customer: {
    name: '',
    contact: '',
    phone: '',
    address: ''
  },
  orderType: 'product',
  items: [
    {
      productId: '',
      quantity: 1,
      price: 0,
      total: 0
    }
  ],
  rental: {
    equipmentId: '',
    duration: 1,
    fee: 0
  },
  service: {
    serviceId: '',
    fee: 0,
    requirements: ''
  },
  deliveryDate: '',
  remarks: ''
})

// 表单验证规则
const rules = {
  'customer.name': [
    { required: true, message: '请选择客户', trigger: 'change' }
  ],
  'customer.contact': [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  'customer.phone': [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  'customer.address': [
    { required: true, message: '请输入收货地址', trigger: 'blur' }
  ],
  orderType: [
    { required: true, message: '请选择订单类型', trigger: 'change' }
  ],
  'rental.equipmentId': [
    { required: true, message: '请选择租赁设备', trigger: 'change' }
  ],
  'rental.duration': [
    { required: true, message: '请输入租赁时间', trigger: 'blur' },
    { type: 'number', min: 1, message: '租赁时间必须大于0', trigger: 'blur' }
  ],
  'service.serviceId': [
    { required: true, message: '请选择服务项目', trigger: 'change' }
  ],
  'service.requirements': [
    { required: true, message: '请输入服务要求', trigger: 'blur' }
  ],
  deliveryDate: [
    { required: true, message: '请选择预计交付日期', trigger: 'change' }
  ]
}

// 自动保存定时器
let autoSaveTimer = null

// 客户选择处理
const handleCustomerSelect = (value) => {
  // 模拟获取客户详情
  const customer = {
    contact: '张三',
    phone: '13800138000',
    address: '上海市浦东新区XX路XX号'
  }
  orderForm.customer.contact = customer.contact
  orderForm.customer.phone = customer.phone
  orderForm.customer.address = customer.address
}

// 订单类型变更处理
const handleOrderTypeChange = () => {
  // 重置相关表单数据
  if (orderForm.orderType === 'product') {
    orderForm.items = [{
      productId: '',
      quantity: 1,
      price: 0,
      total: 0
    }]
  } else if (orderForm.orderType === 'rental') {
    orderForm.rental = {
      equipmentId: '',
      duration: 1,
      fee: 0
    }
  } else {
    orderForm.service = {
      serviceId: '',
      fee: 0,
      requirements: ''
    }
  }
}

// 商品选择处理
const handleProductSelect = (productId, index) => {
  const product = productOptions.find(p => p.id === productId)
  if (product) {
    orderForm.items[index].price = product.price
    calculateItemTotal(index)
  }
}

// 设备选择处理
const handleEquipmentSelect = (equipmentId) => {
  const equipment = equipmentOptions.find(e => e.id === equipmentId)
  if (equipment) {
    calculateRentalFee()
  }
}

// 服务选择处理
const handleServiceSelect = (serviceId) => {
  const service = serviceOptions.find(s => s.id === serviceId)
  if (service) {
    orderForm.service.fee = service.price
  }
}

// 计算商品小计
const calculateItemTotal = (index) => {
  const item = orderForm.items[index]
  item.total = item.price * item.quantity
}

// 计算租赁费用
const calculateRentalFee = () => {
  const equipment = equipmentOptions.find(e => e.id === orderForm.rental.equipmentId)
  if (equipment) {
    orderForm.rental.fee = equipment.dailyRate * orderForm.rental.duration
  }
}

// 获取最大可购买数量
const getMaxQuantity = (item) => {
  const product = productOptions.find(p => p.id === item.productId)
  return product ? product.stock : 1
}

// 添加商品项
const addOrderItem = () => {
  orderForm.items.push({
    productId: '',
    quantity: 1,
    price: 0,
    total: 0
  })
}

// 移除商品项
const removeOrderItem = (index) => {
  orderForm.items.splice(index, 1)
}

// 计算订单总额
const calculateOrderTotal = () => {
  if (orderForm.orderType === 'product') {
    return orderForm.items.reduce((sum, item) => sum + item.total, 0)
  } else if (orderForm.orderType === 'rental') {
    return orderForm.rental.fee
  } else {
    return orderForm.service.fee
  }
}

// 禁用的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now()
}

// 提交订单
const submitOrder = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // TODO: 实现实际的提交逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('订单提交成功')
    resetForm()
  } catch (error) {
    ElMessage.error('表单验证失败，请检查必填项')
  } finally {
    submitting.value = false
  }
}

// 保存草稿
const saveDraft = async () => {
  saving.value = true
  try {
    // TODO: 实现实际的保存逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    orderStatus.isDraft = true
    orderStatus.lastSaved = new Date()
    ElMessage.success('草稿保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  ElMessageBox.confirm('确定要重置表单吗？所有未保存的内容将丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    formRef.value?.resetFields()
    handleOrderTypeChange()
    ElMessage.success('表单已重置')
  })
}

// 自动保存
const autoSave = () => {
  if (!orderStatus.isDraft) {
    saveDraft()
  }
}

// 生命周期钩子
onMounted(() => {
  // 设置自动保存
  autoSaveTimer = setInterval(autoSave, 300000) // 每5分钟自动保存
})

onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
})
</script>

<style scoped>
.order-create {
  padding: 20px;
}

.order-card {
  max-width: 1200px;
  margin: 0 auto;
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

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.form-section h3 {
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dcdfe6;
  color: #303133;
  font-size: 16px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

.order-total {
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.total-amount {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .order-create {
    padding: 10px;
  }
  
  .order-card {
    margin: 0;
  }
  
  .form-section {
    padding: 15px;
    margin-bottom: 20px;
  }
  
  .order-item {
    padding: 10px;
  }
  
  .el-col {
    margin-bottom: 10px;
  }
}
</style>