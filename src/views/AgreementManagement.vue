<template>
  <div class="agreement-management">
    <!-- 搜索过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="协议名称">
          <el-input v-model="searchForm.name" placeholder="请输入协议名称" clearable />
        </el-form-item>
        <el-form-item label="协议状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
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

    <!-- 协议列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>协议管理</h2>
          <el-button type="primary" @click="showTemplateDialog">新建协议</el-button>
        </div>
      </template>

      <el-table :data="agreementList" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="协议名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="templateName" label="模板来源" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable />
        <el-table-column prop="updateTime" label="最后修改" width="180" sortable />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="editAgreement(row)">编辑</el-button>
            <el-button link type="primary" @click="viewReviewComments(row)" v-if="row.status === 'rejected'">
              查看意见
            </el-button>
            <el-button link type="success" @click="submitForReview(row)" v-if="['draft', 'rejected'].includes(row.status)">
              提交审核
            </el-button>
            <el-button link type="danger" @click="deleteAgreement(row)">删除</el-button>
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

    <!-- 选择模板对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      title="选择协议模板"
      width="50%">
      <el-table
        :data="templateList"
        highlight-current-row
        @current-change="handleTemplateSelect"
        style="width: 100%">
        <el-table-column prop="name" label="模板名称" />
        <el-table-column prop="description" label="说明" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="viewTemplate(row)">查看模板</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="templateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createFromTemplate" :disabled="!selectedTemplate">
            确定使用
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看模板对话框 -->
    <el-dialog
      v-model="viewTemplateDialogVisible"
      :title="currentTemplate?.name"
      width="70%"
      class="template-view-dialog">
      <div class="template-content">
        <div class="template-header">
          <div class="version-info">
            <span>版本号：{{ currentTemplate?.version }}</span>
            <span>更新时间：{{ currentTemplate?.updateTime }}</span>
          </div>
          <div v-if="currentTemplate?.hasUpdate" class="update-notice">
            <el-alert
              title="有新版本可用"
              type="info"
              :closable="false">
              <template #default>
                <el-button link type="primary" @click="showVersionComparison">查看版本对比</el-button>
              </template>
            </el-alert>
          </div>
        </div>
        
        <el-tabs v-model="activeTemplateTab">
          <el-tab-pane label="协议内容" name="content">
            <div class="template-sections">
              <div v-for="(section, index) in currentTemplate?.sections" 
                   :key="index" 
                   class="template-section">
                <h3>{{ section.title }}</h3>
                <div class="section-content" v-html="section.content"></div>
                <div v-if="section.notes" class="section-notes">
                  <el-tag size="small" type="warning">注释</el-tag>
                  <p>{{ section.notes }}</p>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="重点条款" name="highlights">
            <div class="highlights-list">
              <el-timeline>
                <el-timeline-item
                  v-for="(highlight, index) in currentTemplate?.highlights"
                  :key="index"
                  :type="highlight.type"
                  :color="getHighlightColor(highlight.type)">
                  <h4>{{ highlight.title }}</h4>
                  <p>{{ highlight.content }}</p>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- 版本对比对话框 -->
    <el-dialog
      v-model="versionCompareDialogVisible"
      title="版本对比"
      width="80%">
      <div class="version-compare">
        <el-tabs type="border-card">
          <el-tab-pane label="变更概览">
            <div class="change-summary">
              <el-timeline>
                <el-timeline-item
                  v-for="(change, index) in versionChanges"
                  :key="index"
                  :type="change.type"
                  :color="getChangeColor(change.type)">
                  <h4>{{ change.title }}</h4>
                  <p>{{ change.description }}</p>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
          <el-tab-pane label="详细对比">
            <div class="diff-view">
              <div v-for="(diff, index) in versionDiffs" 
                   :key="index" 
                   :class="['diff-item', diff.type]">
                <div class="diff-header">{{ diff.section }}</div>
                <div class="diff-content">
                  <div class="old-version">
                    <h4>原版本</h4>
                    <p>{{ diff.oldContent }}</p>
                  </div>
                  <div class="new-version">
                    <h4>新版本</h4>
                    <p>{{ diff.newContent }}</p>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- 审核意见对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="审核意见"
      width="40%">
      <div class="review-comments">
        <div v-for="comment in currentReviewComments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="reviewer">{{ comment.reviewer }}</span>
            <span class="time">{{ comment.time }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 常量定义
const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '审核中', value: 'reviewing' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
]

// 状态管理
const loading = ref(false)
const templateDialogVisible = ref(false)
const reviewDialogVisible = ref(false)
const selectedTemplate = ref(null)
const currentReviewComments = ref([])
const viewTemplateDialogVisible = ref(false)
const versionCompareDialogVisible = ref(false)
const currentTemplate = ref(null)
const activeTemplateTab = ref('content')
const versionChanges = ref([])
const versionDiffs = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  dateRange: []
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 列表数据
const agreementList = ref([])
const templateList = ref([])

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    draft: 'info',
    reviewing: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回'
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

// 模板选择
const showTemplateDialog = () => {
  templateDialogVisible.value = true
  loadTemplates()
}

const handleTemplateSelect = (template) => {
  selectedTemplate.value = template
}

const createFromTemplate = () => {
  if (!selectedTemplate.value) return
  
  templateDialogVisible.value = false
  // 跳转到协议编辑页面，带上模板ID
  router.push({
    name: 'AgreementDraft',
    query: { templateId: selectedTemplate.value.id }
  })
}

// 协议操作
const editAgreement = (agreement) => {
  router.push({
    name: 'AgreementDraft',
    query: { id: agreement.id }
  })
}

const submitForReview = async (agreement) => {
  try {
    loading.value = true
    // TODO: 实现实际的提交审核逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('提交审核成功')
    loadData()
  } catch (error) {
    ElMessage.error('提交审核失败')
  } finally {
    loading.value = false
  }
}

const viewReviewComments = (agreement) => {
  // 模拟获取审核意见
  currentReviewComments.value = [
    {
      id: 1,
      reviewer: '审核员A',
      time: '2024-01-15 14:30:00',
      content: '第三条款中关于收益分配的描述需要更加明确'
    },
    {
      id: 2,
      reviewer: '审核员B',
      time: '2024-01-15 15:00:00',
      content: '建议补充违约责任相关条款'
    }
  ]
  reviewDialogVisible.value = true
}

const deleteAgreement = (agreement) => {
  ElMessageBox.confirm(
    '确定要删除该协议吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    loading.value = true
    try {
      // TODO: 实现实际的删除逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    } finally {
      loading.value = false
    }
  })
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 实现实际的数据加载逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    agreementList.value = [
      {
        id: 1,
        name: '战略合作协议-A公司',
        templateName: '战略合作协议模板',
        status: 'draft',
        createTime: '2024-01-15 14:30:00',
        updateTime: '2024-01-15 14:30:00'
      },
      {
        id: 2,
        name: '业务合作协议-B公司',
        templateName: '业务合作协议模板',
        status: 'reviewing',
        createTime: '2024-01-14 09:00:00',
        updateTime: '2024-01-15 10:00:00'
      },
      {
        id: 3,
        name: '代理协议-C公司',
        templateName: '代理协议模板',
        status: 'rejected',
        createTime: '2024-01-13 16:00:00',
        updateTime: '2024-01-14 11:30:00'
      }
    ]
    pagination.total = 20
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载模板
const loadTemplates = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    templateList.value = [
      {
        id: 1,
        name: '标准合作协议模板',
        description: '适用于一般性业务合作伙伴关系',
        updateTime: '2024-01-01 10:00:00',
        version: 'v2.1',
        hasUpdate: true,
        sections: [
          {
            title: '第一条 合作期限',
            content: `
              1.1 本协议有效期为自签订之日起2年。
              1.2 合作期满前30天，双方可协商续约事宜。
              1.3 续约时需重新评估合作条件，包括但不限于业绩指标、收益分配等。
            `,
            notes: '续约需提前一个月发起申请，避免合作中断'
          },
          {
            title: '第二条 区域限制',
            content: `
              2.1 合作商经营区域限定在约定的行政区域范围内。
              2.2 未经平台书面许可，不得跨区域经营。
              2.3 区域保护：平台承诺在约定区域内不再发展其他合作商。
            `,
            notes: '区域边界需明确界定，避免纠纷'
          },
          {
            title: '第三条 权益分配',
            content: `
              3.1 平台与合作商的收益分配比例为7:3。
              3.2 收益计算方式：以实际成交金额为基数。
              3.3 结算周期：每月结算一次。
            `,
            notes: '重点关注分成比例的调整机制和结算时间'
          },
          {
            title: '第四条 业绩考核',
            content: `
              4.1 季度最低销售额要求：100万元
              4.2 年度目标完成率要求：不低于85%
              4.3 考核未达标处理方式
            `,
            notes: '业绩指标将根据市场情况适时调整'
          }
        ],
        highlights: [
          {
            type: 'warning',
            title: '业绩考核指标',
            content: '季度销售额100万元，年度目标完成率85%'
          },
          {
            type: 'danger',
            title: '违约责任',
            content: '跨区域经营将承担销售额20%的违约金'
          },
          {
            type: 'primary',
            title: '收益分配',
            content: '平台与合作商收益比例7:3，每月结算'
          }
        ]
      },
      {
        id: 2,
        name: '战略合作协议模板',
        description: '适用于长期战略合作伙伴关系',
        updateTime: '2024-01-05 09:00:00',
        version: 'v1.8',
        hasUpdate: false,
        sections: [
          {
            title: '第一条 战略合作目标',
            content: `
              1.1 双方本着"优势互补、互利共赢"的原则开展战略合作。
              1.2 建立长期稳定的战略合作伙伴关系。
              1.3 共同开拓市场，提升品牌价值。
            `,
            notes: '明确合作愿景和目标'
          },
          {
            title: '第二条 合作领域',
            content: `
              2.1 市场开发：共同开发和拓展市场。
              2.2 品牌建设：共享品牌资源，协同推广。
              2.3 技术创新：共同研发和技术升级。
            `,
            notes: '重点关注合作范围界定'
          },
          {
            title: '第三条 资源共享',
            content: `
              3.1 渠道资源共享机制。
              3.2 客户资源互通规则。
              3.3 技术资源整合方案。
            `,
            notes: '注意资源共享的保密条款'
          }
        ],
        highlights: [
          {
            type: 'primary',
            title: '合作期限',
            content: '初始合作期限5年，可续约'
          },
          {
            type: 'warning',
            title: '最低投入',
            content: '年度市场投入不低于500万元'
          }
        ]
      },
      {
        id: 3,
        name: '代理商协议模板',
        description: '适用于代理商合作关系',
        updateTime: '2024-01-10 14:00:00',
        version: 'v2.3',
        hasUpdate: true,
        sections: [
          {
            title: '第一条 代理权限',
            content: `
              1.1 代理区域：指定行政区域范围。
              1.2 代理产品：全系列产品代理权。
              1.3 代理级别：一级代理商资格。
            `,
            notes: '明确代理权限范围和限制'
          },
          {
            title: '第二条 销售任务',
            content: `
              2.1 年度销售目标：不低于1000万元。
              2.2 季度任务考核：每季度不低于250万元。
              2.3 未完成任务的处理方式。
            `,
            notes: '销售指标可根据市场情况调整'
          },
          {
            title: '第三条 返利政策',
            content: `
              3.1 基础返利：完成基础任务返利5%。
              3.2 增量返利：超额完成部分返利8%。
              3.3 返利计算及发放方式。
            `,
            notes: '返利政策每年度更新一次'
          }
        ],
        highlights: [
          {
            type: 'primary',
            title: '代理级别',
            content: '一级代理商，享有区域独家代理权'
          },
          {
            type: 'warning',
            title: '销售指标',
            content: '年度销售额1000万，季度250万'
          },
          {
            type: 'success',
            title: '返利政策',
            content: '基础返利5%，增量返利8%'
          }
        ]
      },
      {
        id: 4,
        name: '加盟商协议模板',
        description: '适用于连锁加盟业务',
        updateTime: '2024-01-15 16:00:00',
        version: 'v1.5',
        hasUpdate: false,
        sections: [
          {
            title: '第一条 加盟条件',
            content: `
              1.1 加盟费：30万元/家店。
              1.2 店面要求：面积不少于100平米。
              1.3 位置要求：商业核心区域。
            `,
            notes: '加盟条件可能因城市等级不同而调整'
          },
          {
            title: '第二条 品牌使用',
            content: `
              2.1 品牌授权范围。
              2.2 店面形象要求。
              2.3 营运规范遵守。
            `,
            notes: '严格遵守品牌形象规范'
          },
          {
            title: '第三条 利润分配',
            content: `
              3.1 加盟商承担运营成本。
              3.2 按营业额比例收取管理费。
              3.3 货品统一采购定价。
            `,
            notes: '利润分配方案需遵守当地法规'
          }
        ],
        highlights: [
          {
            type: 'danger',
            title: '加盟费用',
            content: '初始加盟费30万元/店'
          },
          {
            type: 'warning',
            title: '场地要求',
            content: '核心商圈，面积≥100平米'
          },
          {
            type: 'primary',
            title: '管理费用',
            content: '营业额3%的持续管理费'
          }
        ]
      }
    ]
  } catch (error) {
    ElMessage.error('加载模板失败')
  }
}

// 查看模板
const viewTemplate = async (template) => {
  try {
    // 模拟加载模板详情
    currentTemplate.value = {
      ...template,
      version: 'v2.1',
      hasUpdate: true,
      versionInfo: {
        releaseDate: '2024-01-15',
        updateLog: '调整了业绩考核指标和违约金比例'
      }
    }
    
    // 加载版本对比数据
    versionChanges.value = [
      {
        type: 'primary',
        title: '业绩考核指标调整',
        description: '季度考核指标由80万调整为100万，年度目标完成率要求由80%提升至85%'
      },
      {
        type: 'warning',
        title: '违约金比例变更',
        description: '跨区域经营违约金比例由15%上调至20%'
      },
      {
        type: 'info',
        title: '结算周期优化',
        description: '结算周期由季度改为月度，提高资金周转效率'
      }
    ]
    
    versionDiffs.value = [
      {
        type: 'modified',
        section: '第四条 业绩考核',
        oldContent: '4.1 季度最低销售额要求：80万元\n4.2 年度目标完成率要求：不低于80%',
        newContent: '4.1 季度最低销售额要求：100万元\n4.2 年度目标完成率要求：不低于85%'
      },
      {
        type: 'modified',
        section: '第八条 违约责任',
        oldContent: '跨区域经营将承担销售额15%的违约金',
        newContent: '跨区域经营将承担销售额20%的违约金'
      },
      {
        type: 'added',
        section: '第三条 权益分配',
        oldContent: '3.3 结算周期：每季度结算一次',
        newContent: '3.3 结算周期：每月结算一次'
      }
    ]
    
    viewTemplateDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载模板详情失败')
  }
}

// 显示版本对比
const showVersionComparison = () => {
  // 模拟加载版本对比数据
  versionChanges.value = [
    {
      type: 'primary',
      title: '业绩考核指标调整',
      description: '季度考核指标由80万调整为100万'
    },
    {
      type: 'warning',
      title: '违约金比例变更',
      description: '违约金比例由15%上调至20%'
    }
  ]
  
  versionDiffs.value = [
    {
      type: 'modified',
      section: '第四条 业绩目标',
      oldContent: '每季度最低销售额不低于80万元',
      newContent: '每季度最低销售额不低于100万元'
    },
    {
      type: 'modified',
      section: '第八条 违约责任',
      oldContent: '违反区域限制条款将承担销售额15%的违约金',
      newContent: '违反区域限制条款将承担销售额20%的违约金'
    }
  ]
  
  versionCompareDialogVisible.value = true
}

// 获取高亮颜色
const getHighlightColor = (type) => {
  const colorMap = {
    warning: '#E6A23C',
    danger: '#F56C6C',
    primary: '#409EFF'
  }
  return colorMap[type] || '#909399'
}

// 获取变更颜色
const getChangeColor = getHighlightColor

// 生命周期钩子
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.agreement-management {
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

.review-comments {
  max-height: 400px;
  overflow-y: auto;
}

.comment-item {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.reviewer {
  font-weight: 500;
  color: #303133;
}

.time {
  color: #909399;
  font-size: 12px;
}

.comment-content {
  color: #606266;
  line-height: 1.5;
}

@media screen and (max-width: 768px) {
  .agreement-management {
    padding: 10px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
  }
}

.template-view-dialog :deep(.el-dialog__body) {
  padding: 0 20px;
}

.template-content {
  padding: 20px 0;
}

.template-header {
  margin-bottom: 20px;
}

.version-info {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.template-section {
  margin-bottom: 30px;
}

.template-section h3 {
  margin-bottom: 15px;
  color: #303133;
}

.section-content {
  line-height: 1.6;
  color: #606266;
}

.section-notes {
  margin-top: 10px;
  padding: 10px;
  background-color: #fdf6ec;
  border-radius: 4px;
}

.section-notes p {
  margin: 5px 0 0;
  color: #e6a23c;
}

.highlights-list {
  padding: 20px;
}

.version-compare {
  height: 600px;
  overflow-y: auto;
}

.change-summary {
  padding: 20px;
}

.diff-view {
  padding: 20px;
}

.diff-item {
  margin-bottom: 30px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.diff-header {
  padding: 10px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  font-weight: bold;
}

.diff-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
}

.old-version, .new-version {
  padding: 15px;
  border-radius: 4px;
}

.old-version {
  background-color: #fef0f0;
}

.new-version {
  background-color: #f0f9eb;
}

.diff-item.modified .diff-header {
  color: #e6a23c;
}
</style>