<template>
  <div class="agreement-draft">
    <el-card class="draft-card">
      <template #header>
        <div class="card-header">
          <h2>协议起草与审核</h2>
          <div class="header-actions">
            <el-tag v-if="draftStatus.isDraft" type="info">草稿已保存</el-tag>
            <el-button type="primary" @click="submitForReview" :loading="submitting">
              提交审核
            </el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="draftForm"
        :rules="rules"
        label-width="120px"
        @submit.prevent>
        
        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>
          <el-form-item label="协议类型" prop="type">
            <el-select v-model="draftForm.type" placeholder="请选择协议类型" style="width: 100%">
              <el-option
                v-for="type in agreementTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="合作方" prop="partner">
            <el-select
              v-model="draftForm.partner"
              filterable
              placeholder="请选择合作方"
              style="width: 100%">
              <el-option
                v-for="partner in partnerOptions"
                :key="partner.value"
                :label="partner.label"
                :value="partner.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="协议编号" prop="number">
            <el-input v-model="draftForm.number" placeholder="系统自动生成" disabled />
          </el-form-item>

          <el-form-item label="生效日期" prop="effectiveDate">
            <el-date-picker
              v-model="draftForm.effectiveDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="协议期限" prop="duration">
            <el-input-number
              v-model="draftForm.duration"
              :min="1"
              :max="10"
              style="width: 200px"
            />
            <span class="unit-text">年</span>
          </el-form-item>
        </div>

        <!-- 协议内容 -->
        <div class="form-section">
          <h3>协议内容</h3>
          <el-tabs v-model="activeTab" class="draft-tabs">
            <el-tab-pane label="合作范围" name="scope">
              <el-form-item label="业务类型" prop="content.businessTypes">
                <el-checkbox-group v-model="draftForm.content.businessTypes">
                  <el-checkbox label="aerial">航空摄影</el-checkbox>
                  <el-checkbox label="mapping">测绘服务</el-checkbox>
                  <el-checkbox label="training">培训服务</el-checkbox>
                  <el-checkbox label="maintenance">维护服务</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <el-form-item label="合作区域" prop="content.regions">
                <el-select
                  v-model="draftForm.content.regions"
                  multiple
                  placeholder="请选择合作区域"
                  style="width: 100%">
                  <el-option label="华东地区" value="east" />
                  <el-option label="华北地区" value="north" />
                  <el-option label="华南地区" value="south" />
                  <el-option label="西南地区" value="southwest" />
                </el-select>
              </el-form-item>

              <el-form-item label="详细说明" prop="content.scopeDescription">
                <el-input
                  v-model="draftForm.content.scopeDescription"
                  type="textarea"
                  :rows="4"
                  placeholder="请详细描述合作范围"
                />
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="权责划分" name="responsibilities">
              <el-form-item label="甲方职责" prop="content.partyAResponsibilities">
                <el-input
                  v-model="draftForm.content.partyAResponsibilities"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入甲方职责"
                />
              </el-form-item>

              <el-form-item label="乙方职责" prop="content.partyBResponsibilities">
                <el-input
                  v-model="draftForm.content.partyBResponsibilities"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入乙方职责"
                />
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="收益分配" name="benefits">
              <el-form-item label="分配方案" prop="content.profitSharing">
                <el-input-number
                  v-model="draftForm.content.profitSharing.partyA"
                  :min="0"
                  :max="100"
                  style="width: 150px"
                />
                <span class="percentage-text">% : </span>
                <el-input-number
                  v-model="draftForm.content.profitSharing.partyB"
                  :min="0"
                  :max="100"
                  style="width: 150px"
                />
                <span class="percentage-text">%</span>
              </el-form-item>

              <el-form-item label="结算周期" prop="content.settlementPeriod">
                <el-select v-model="draftForm.content.settlementPeriod" style="width: 100%">
                  <el-option label="按月结算" value="monthly" />
                  <el-option label="按季度结算" value="quarterly" />
                  <el-option label="按年结算" value="yearly" />
                </el-select>
              </el-form-item>

              <el-form-item label="结算说明" prop="content.settlementDescription">
                <el-input
                  v-model="draftForm.content.settlementDescription"
                  type="textarea"
                  :rows="4"
                  placeholder="请详细描述结算方式和要求"
                />
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="其他条款" name="others">
              <el-form-item label="保密条款" prop="content.confidentiality">
                <el-input
                  v-model="draftForm.content.confidentiality"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入保密条款内容"
                />
              </el-form-item>

              <el-form-item label="违约责任" prop="content.breach">
                <el-input
                  v-model="draftForm.content.breach"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入违约责任条款"
                />
              </el-form-item>

              <el-form-item label="争议解决" prop="content.disputeResolution">
                <el-input
                  v-model="draftForm.content.disputeResolution"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入争议解决方式"
                />
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 附件上传 -->
        <div class="form-section">
          <h3>附件材料</h3>
          <el-form-item label="相关附件">
            <el-upload
              class="upload-demo"
              action="/api/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :before-remove="beforeRemove"
              multiple
              :limit="5">
              <el-button type="primary">点击上传</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  可上传补充协议、授权书等相关文件，单个文件不超过10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </div>

        <!-- 备注信息 -->
        <div class="form-section">
          <h3>备注说明</h3>
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="draftForm.remarks"
              type="textarea"
              :rows="4"
              placeholder="请输入其他需要说明的事项"
            />
          </el-form-item>
        </div>

        <!-- 表单操作 -->
        <div class="form-actions">
          <el-button type="primary" @click="saveDraft" :loading="saving">
            保存草稿
          </el-button>
          <el-button @click="resetForm" :disabled="saving || submitting">
            重置
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 表单引用
const formRef = ref(null)

// 状态管理
const activeTab = ref('scope')
const saving = ref(false)
const submitting = ref(false)
const draftStatus = reactive({
  isDraft: false,
  lastSaved: null
})

// 常量定义
const agreementTypes = [
  { label: '战略合作协议', value: 'strategic' },
  { label: '业务合作协议', value: 'business' },
  { label: '代理协议', value: 'agency' }
]

const partnerOptions = [
  { label: '示例公司1', value: 'company1' },
  { label: '示例公司2', value: 'company2' }
]

// 表单数据
const draftForm = reactive({
  type: '',
  partner: '',
  number: 'AGR' + Date.now(),
  effectiveDate: '',
  duration: 1,
  content: {
    businessTypes: [],
    regions: [],
    scopeDescription: '',
    partyAResponsibilities: '',
    partyBResponsibilities: '',
    profitSharing: {
      partyA: 50,
      partyB: 50
    },
    settlementPeriod: 'monthly',
    settlementDescription: '',
    confidentiality: '',
    breach: '',
    disputeResolution: ''
  },
  remarks: '',
  attachments: []
})

// 表单验证规则
const rules = {
  type: [
    { required: true, message: '请选择协议类型', trigger: 'change' }
  ],
  partner: [
    { required: true, message: '请选择合作方', trigger: 'change' }
  ],
  effectiveDate: [
    { required: true, message: '请选择生效日期', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请输入协议期限', trigger: 'blur' }
  ],
  'content.businessTypes': [
    { required: true, message: '请选择业务类型', trigger: 'change' }
  ],
  'content.regions': [
    { required: true, message: '请选择合作区域', trigger: 'change' }
  ],
  'content.scopeDescription': [
    { required: true, message: '请输入合作范围说明', trigger: 'blur' }
  ],
  'content.partyAResponsibilities': [
    { required: true, message: '请输入甲方职责', trigger: 'blur' }
  ],
  'content.partyBResponsibilities': [
    { required: true, message: '请输入乙方职责', trigger: 'blur' }
  ],
  'content.settlementDescription': [
    { required: true, message: '请输入结算说明', trigger: 'blur' }
  ]
}

// 自动保存定时器
let autoSaveTimer = null

// 文件处理方法
const handlePreview = (file) => {
  console.log(file)
}

const handleRemove = (file, fileList) => {
  console.log(file, fileList)
}

const beforeRemove = (file) => {
  return ElMessageBox.confirm(`确定移除 ${file.name}？`)
}

// 表单操作方法
const saveDraft = async () => {
  saving.value = true
  try {
    // TODO: 实现实际的保存逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    draftStatus.isDraft = true
    draftStatus.lastSaved = new Date()
    ElMessage.success('草稿保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const submitForReview = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // TODO: 实现实际的提交逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('提交审核成功')
    draftStatus.isDraft = false
  } catch (error) {
    ElMessage.error('表单验证失败，请检查必填项')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  ElMessageBox.confirm('确定要重置表单吗？所有未保存的内容将丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    formRef.value?.resetFields()
    ElMessage.success('表单已重置')
  })
}

// 自动保存
const autoSave = () => {
  if (!draftStatus.isDraft) {
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
.agreement-draft {
  padding: 20px;
}

.draft-card {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
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

.unit-text,
.percentage-text {
  margin: 0 8px;
  color: #606266;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.draft-tabs {
  margin-top: 20px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .agreement-draft {
    padding: 10px;
  }
  
  .draft-card {
    margin: 0;
  }
  
  .form-section {
    padding: 15px;
    margin-bottom: 20px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>