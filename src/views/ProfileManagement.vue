<template>
  <div class="profile-management">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>资料管理</h2>
          <el-tag v-if="formStatus.isDraft" type="info">草稿已保存</el-tag>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="profileForm"
        :rules="rules"
        label-width="120px"
        @submit.prevent="saveProfile"
        status-icon>
        
        <!-- 个人信息部分 -->
        <div class="form-section">
          <h3>个人信息</h3>
          <el-form-item label="姓名" prop="personalInfo.name">
            <el-input v-model="profileForm.personalInfo.name" maxlength="50" show-word-limit />
          </el-form-item>
          
          <el-form-item label="性别" prop="personalInfo.gender">
            <el-radio-group v-model="profileForm.personalInfo.gender">
              <el-radio label="male">男</el-radio>
              <el-radio label="female">女</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="联系电话" prop="personalInfo.phone">
            <el-input v-model="profileForm.personalInfo.phone" />
          </el-form-item>
          
          <el-form-item label="电子邮箱" prop="personalInfo.email">
            <el-input v-model="profileForm.personalInfo.email" />
          </el-form-item>
          
          <el-form-item label="身份证号" prop="personalInfo.idNumber">
            <el-input v-model="profileForm.personalInfo.idNumber" />
          </el-form-item>
          
          <el-form-item label="紧急联系人" prop="personalInfo.emergencyContact.name">
            <el-input v-model="profileForm.personalInfo.emergencyContact.name" />
          </el-form-item>
          
          <el-form-item label="紧急联系电话" prop="personalInfo.emergencyContact.phone">
            <el-input v-model="profileForm.personalInfo.emergencyContact.phone" />
          </el-form-item>
        </div>
        
        <!-- 企业信息部分 -->
        <div class="form-section">
          <h3>企业信息</h3>
          <el-form-item label="营业执照号" prop="businessInfo.licenseNumber">
            <el-input v-model="profileForm.businessInfo.licenseNumber" />
          </el-form-item>
          
          <el-form-item label="企业名称" prop="businessInfo.companyName">
            <el-input v-model="profileForm.businessInfo.companyName" />
          </el-form-item>
          
          <el-form-item label="法定代表人" prop="businessInfo.legalRepresentative">
            <el-input v-model="profileForm.businessInfo.legalRepresentative" />
          </el-form-item>
          
          <el-form-item label="注册资本" prop="businessInfo.registeredCapital">
            <el-input-number 
              v-model="profileForm.businessInfo.registeredCapital"
              :min="0"
              :precision="2"
              :step="1000"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="经营状态" prop="businessInfo.operatingStatus">
            <el-select v-model="profileForm.businessInfo.operatingStatus" style="width: 100%">
              <el-option label="正常经营" value="operating" />
              <el-option label="筹备中" value="preparing" />
              <el-option label="停业" value="suspended" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="企业地址" prop="businessInfo.address">
            <el-input v-model="profileForm.businessInfo.address" type="textarea" />
          </el-form-item>
          
          <el-form-item label="经营范围" prop="businessInfo.businessScope">
            <el-input 
              v-model="profileForm.businessInfo.businessScope"
              type="textarea"
              maxlength="500"
              show-word-limit
              :rows="4"
            />
          </el-form-item>
        </div>
        
        <!-- 文件上传部分 -->
        <div class="form-section">
          <h3>资质文件</h3>
          <el-form-item label="营业执照" prop="documents.businessLicense">
            <el-upload
              class="upload-container"
              action="/api/upload"
              :before-upload="beforeUpload"
              :on-success="handleLicenseSuccess"
              :on-error="handleUploadError"
              :file-list="profileForm.documents.businessLicense"
              :limit="1">
              <el-button type="primary">上传营业执照</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  请上传PDF、JPG或PNG格式文件，大小不超过10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
          
          <el-form-item label="资质证书" prop="documents.qualifications">
            <el-upload
              class="upload-container"
              action="/api/upload"
              :before-upload="beforeUpload"
              :on-success="handleQualificationSuccess"
              :on-error="handleUploadError"
              :file-list="profileForm.documents.qualifications"
              :limit="5"
              multiple>
              <el-button type="primary">上传资质证书</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  最多上传5个文件，每个文件不超过10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </div>
        
        <!-- 表单操作按钮 -->
        <div class="form-actions">
          <el-button type="primary" @click="saveProfile" :loading="formStatus.isSaving">
            保存
          </el-button>
          <el-button @click="resetForm" :disabled="formStatus.isSaving">
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

// 表单状态管理
const formStatus = reactive({
  isDraft: false,
  isSaving: false,
  lastSaved: null
})

// 表单数据结构
const profileForm = reactive({
  personalInfo: {
    name: '',
    gender: '',
    phone: '',
    email: '',
    idNumber: '',
    emergencyContact: {
      name: '',
      phone: ''
    }
  },
  businessInfo: {
    licenseNumber: '',
    companyName: '',
    legalRepresentative: '',
    registeredCapital: 0,
    operatingStatus: '',
    address: '',
    businessScope: ''
  },
  documents: {
    businessLicense: [],
    qualifications: []
  }
})

// 表单验证规则
const rules = {
  'personalInfo.name': [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符之间', trigger: 'blur' }
  ],
  'personalInfo.gender': [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  'personalInfo.phone': [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  'personalInfo.email': [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  'personalInfo.idNumber': [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  'personalInfo.emergencyContact.name': [
    { required: true, message: '请输入紧急联系人姓名', trigger: 'blur' }
  ],
  'personalInfo.emergencyContact.phone': [
    { required: true, message: '请输入紧急联系人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  'businessInfo.licenseNumber': [
    { required: true, message: '请输入营业执照号', trigger: 'blur' }
  ],
  'businessInfo.companyName': [
    { required: true, message: '请输入企业名称', trigger: 'blur' }
  ],
  'businessInfo.legalRepresentative': [
    { required: true, message: '请输入法定代表人姓名', trigger: 'blur' }
  ],
  'businessInfo.registeredCapital': [
    { required: true, message: '请输入注册资本', trigger: 'blur' },
    { type: 'number', min: 0, message: '注册资本必须大于0', trigger: 'blur' }
  ],
  'businessInfo.operatingStatus': [
    { required: true, message: '请选择经营状态', trigger: 'change' }
  ],
  'businessInfo.address': [
    { required: true, message: '请输入企业地址', trigger: 'blur' }
  ],
  'businessInfo.businessScope': [
    { required: true, message: '请输入经营范围', trigger: 'blur' },
    { max: 500, message: '经营范围不能超过500个字符', trigger: 'blur' }
  ]
}

// 自动保存定时器
let autoSaveTimer = null

// 文件上传相关方法
const beforeUpload = (file) => {
  const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传JPG/PNG/PDF格式的文件！')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB！')
    return false
  }
  return true
}

const handleLicenseSuccess = (response, file) => {
  profileForm.documents.businessLicense = [file]
  ElMessage.success('营业执照上传成功')
}

const handleQualificationSuccess = (response, file) => {
  profileForm.documents.qualifications.push(file)
  ElMessage.success('资质证书上传成功')
}

const handleUploadError = () => {
  ElMessage.error('文件上传失败，请重试')
}

// 表单操作方法
const saveProfile = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    formStatus.isSaving = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    formStatus.lastSaved = new Date()
    formStatus.isDraft = false
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('表单验证失败，请检查填写的内容')
  } finally {
    formStatus.isSaving = false
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

// 自动保存草稿
const saveDraft = () => {
  formStatus.isDraft = true
  formStatus.lastSaved = new Date()
  // 这里可以实现本地存储逻辑
  localStorage.setItem('profileDraft', JSON.stringify(profileForm))
}

// 生命周期钩子
onMounted(() => {
  // 设置自动保存
  autoSaveTimer = setInterval(saveDraft, 60000) // 每分钟自动保存
  
  // 恢复草稿
  const draft = localStorage.getItem('profileDraft')
  if (draft) {
    Object.assign(profileForm, JSON.parse(draft))
    formStatus.isDraft = true
  }
})

onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
})
</script>

<style scoped>
.profile-management {
  padding: 20px;
}

.profile-card {
  max-width: 900px;
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

.upload-container {
  width: 100%;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .profile-management {
    padding: 10px;
  }
  
  .profile-card {
    margin: 0;
  }
  
  .el-form-item {
    margin-bottom: 18px;
  }
  
  .form-section {
    padding: 15px;
    margin-bottom: 20px;
  }
}
</style>