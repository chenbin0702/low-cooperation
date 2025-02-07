import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../layout/index.vue'
import NProgress from 'nprogress'
import * as Icons from '@element-plus/icons-vue'
// 配置 NProgress
NProgress.configure({ 
  showSpinner: false,  // 是否显示加载微调器
  easing: 'ease',      // 动画方式
  speed: 500,          // 速度
  minimum: 0.3         // 最小百分比
})

export const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/profile-management',
    children: [
      {
        path: '/basic-info',
        name: 'BasicInfo',
        redirect: '/profile-management',
        meta: { 
          title: '基本信息',
          icon: 'InfoFilled'
        },
        children: [
          {
            path: '/profile-management',
            name: 'ProfileManagement',
            component: () => import('../views/ProfileManagement.vue'),
            meta: { 
              title: '资料管理',
            }
          },
          {
            path: '/agreement-management',
            name: 'AgreementManagement',
            component: () => import('../views/AgreementManagement.vue'),
            meta: { 
              title: '协议管理',
            }
          }
        ]
      },
      {
        path: '/business-management',
        name: 'BusinessManagement',
        redirect: '/customer-info',
        meta: { 
          title: '业务管理',
          icon: 'Operation'
        },
        children: [
          {
            path: '/customer-development',
            name: 'CustomerDevelopment',
            redirect: '/customer-info',
            meta: { 
              title: '客户开发与维护',
            },
            children: [
              {
                path: '/customer-info',
                name: 'CustomerInfo',
                component: () => import('../views/CustomerInfo.vue'),
                meta: { 
                  title: '客户信息收集',
                }
              },
              {
                path: '/customer-follow-up',
                name: 'CustomerFollowUp',
                component: () => import('../views/CustomerFollowUp.vue'),
                meta: { 
                  title: '客户跟进记录',
                }
              }
            ]
          },
          {
            path: '/cooperation-negotiation',
            name: 'CooperationNegotiation',
            redirect: '/negotiation-records',
            meta: { 
              title: '合作洽谈管理',
            },
            children: [
              {
                path: '/negotiation-records',
                name: 'NegotiationRecords',
                component: () => import('../views/NegotiationRecords.vue'),
                meta: { 
                  title: '洽谈记录',
                }
              }
            ]
          }
        ]
      },
      {
        path: '/market-analysis',
        name: 'MarketAnalysis',
        redirect: '/industry-trends',
        meta: { 
          title: '市场分析与推广',
          icon: 'TrendCharts'
        },
        children: [
          {
            path: '/market-research',
            name: 'MarketResearch',
            redirect: '/industry-trends',
            meta: { 
              title: '市场信息收集与分析',
            },
            children: [
              {
                path: '/industry-trends',
                name: 'IndustryTrends',
                component: () => import('../views/IndustryTrends.vue'),
                meta: { 
                  title: '行业动态',
                }
              },
              {
                path: '/competitor-analysis',
                name: 'CompetitorAnalysis',
                component: () => import('../views/CompetitorAnalysis.vue'),
                meta: { 
                  title: '竞争对手分析',
                }
              }
            ]
          },
          {
            path: '/promotion-management',
            name: 'PromotionManagement',
            redirect: '/activity-planning',
            meta: { 
              title: '推广活动管理',
            },
            children: [
              {
                path: '/activity-planning',
                name: 'ActivityPlanning',
                component: () => import('../views/ActivityPlanning.vue'),
                meta: { 
                  title: '活动策划与执行',
                }
              },
              {
                path: '/activity-evaluation',
                name: 'ActivityEvaluation',
                component: () => import('../views/ActivityEvaluation.vue'),
                meta: { 
                  title: '活动效果评估',
                }
              }
            ]
          }
        ]
      },
      {
        path: '/order-management',
        name: 'OrderManagement',
        redirect: '/order-create',
        meta: { 
          title: '订单管理',
          icon: 'Document'
        },
        children: [
          {
            path: '/order-tracking',
            name: 'OrderTracking',
            redirect: '/order-create',
            meta: { 
              title: '订单提交与跟踪',
            },
            children: [
              {
                path: '/order-create',
                name: 'OrderCreate',
                component: () => import('../views/OrderCreate.vue'),
                meta: { 
                  title: '订单创建',
                }
              },
              {
                path: '/order-track',
                name: 'OrderTrack',
                component: () => import('../views/OrderTrack.vue'),
                meta: { 
                  title: '订单跟踪',
                }
              }
            ]
          }
        ]
      },
      {
        path: '/commission-management',
        name: 'CommissionManagement',
        meta: { 
          title: '佣金与收入管理',
          icon: 'Money'
        },
        children: [
          {
            path: '/commission-view',
            name: 'CommissionView',
            component: () => import('../views/CommissionView.vue'),
            meta: { 
              title: '佣金计算与查看',
            }
          },
          {
            path: '/income-withdraw',
            name: 'IncomeWithdraw',
            component: () => import('../views/IncomeWithdraw.vue'),
            meta: { 
              title: '收入提现与结算',
            }
          }
        ]
      },
      {
        path: '/inventory-logistics',
        name: 'InventoryLogistics',
        meta: { 
          title: '库存与物流',
          icon: 'Box'
        },
        children: [
          {
            path: '/inventory-management',
            name: 'InventoryManagement',
            meta: { 
              title: '库存管理',
            },
            children: [
              {
                path: '/inventory-query',
                name: 'InventoryQuery',
                component: () => import('../views/InventoryQuery.vue'),
                meta: { 
                  title: '库存查询',
                }
              },
              {
                path: '/inventory-replenishment',
                name: 'InventoryReplenishment',
                component: () => import('../views/InventoryReplenishment.vue'),
                meta: { 
                  title: '补货申请',
                }
              }
            ]
          },
          {
            path: '/logistics-management',
            name: 'LogisticsManagement',
            meta: { 
              title: '物流管理',
            },
            children: [
              {
                path: '/logistics-tracking',
                name: 'LogisticsTracking',
                component: () => import('../views/LogisticsTracking.vue'),
                meta: { 
                  title: '物流跟踪',
                }
              }
            ]
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory('./'),
  routes: routes
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  // 开启进度条
  NProgress.start()
  next()
})

// 路由后置守卫
router.afterEach(() => {
  // 关闭进度条
  NProgress.done()
})

export default router