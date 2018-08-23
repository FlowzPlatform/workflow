import Vue from 'vue'
import VueRouter from 'vue-router'

// Master Layout
import Layout from '@/masterLayout/Master'

// // Layout
// import Layout from '@/layout/Master'
// import userLayout from '@/layout/user/Master'

// // import commonLayout from '@/layout/user/Common.vue'
// // userLayout
// // import userLayout from '@/userLayout/Master'
// import UserDashboard from '@/pages/user/dashboard'
// import list from '@/pages/user/List'

// import Userconfig from '@/pages/user/UserConfig.vue'
// // userLayout
// // import userLayout from '@/userLayout/Master'
// // import UserDashboard from '@/pages/user/dashboard'
// Area
import Dashboard from '@/area/Dashboard'
import Flow from '@/area/Flow'
// import DbSettings from '@/area/DbSettings'
import Schema from '@/area/Schema'
// import Approval from '@/area/Approval'
// Schema area
import SchemaMapping from '@/pages/schema/Mapping'
import SchemaMappingNew from '@/pages/schema/mapping/New'
import SchemaMappingList from '@/pages/schema/mapping/List'
import SchemaList from '@/pages/schema/schemaList'
import SchemaNew from '@/pages/schema/New'
// Flow area
import FlowzList from '@/pages/flow/List'
import FlowNew from '@/pages/flow/New'
import flowInstance from '@/pages/flow/instance/New'
import flowLog from '@/pages/flow/systemLog'
// // DbSettings area
// import DbSettingsList from '@/pages/dbSettings/List'
// import DbSettingsNew from '@/pages/dbSettings/New'
// // pages
import Login from '@/pages/Login'
// import EmailVerification from '@/pages/EmailVerification'
import Register from '@/pages/Register'
// Approval area
// import ApprovalList from '@/pages/approval/List'
// import ApprovalNew from '@/pages/approval/New'
// import Reply from '@/pages/approval/MailReply'
// import FormReply from '@/pages/approval/FormReply'
import Analytics from '@/pages/flow/analytics'
import FlowOverview from '@/pages/flow/FlowOverview'
// User area
// import UserDashboard from '@/pages/user/dashboard'
// import ManageBPMNPlugin from '@/pages/BPMNPlugins/Manage'

// // Approval area
// import ApprovalList from '@/pages/approval/List'
// import ApprovalNew from '@/pages/approval/New'
// import Reply from '@/pages/approval/MailReply'
// import FormReply from '@/pages/approval/FormReply'
// // User area
// // import UserDashboard from '@/pages/user/dashboard'
// // import ManageBPMNPlugin from '@/pages/BPMNPlugins/Manage'

// // import UserDashboard from '@/pages/user/dashboard'
// // import UserProcesslist from '@/pages/user/processlist'
// import Analytics from '@/pages/flow/analytics'
import ManageBPMNPlugin from '@/pages/BPMNPlugins/Manage'

import SchemaView from '@/components/SchemaView'

Vue.use(VueRouter)

const mroutes = [
  {
    path: '/admin',
    name: 'Layout',
    component: Layout,
    meta: { requiresAuth: true, role: [1] },
    children: [
      {
        path: 'dashboard',
        alias: '',
        component: Dashboard,
        name: 'Dashboard'
      },
      { // Plugin
        path: 'bpmn-plugin',
        component: ManageBPMNPlugin,
        name: 'bpmn-plugin',
        meta: { description: 'Schema', requiresAuth: true, role: [1] }
      },
      // { // UserConfig
      //   path: 'userconfig',
      //   component: Userconfig,
      //   name: 'userconfig',
      //   meta: { description: 'Userconfig' }
      // },
      { // Schema
        path: 'schema',
        component: Schema,
        name: 'schema',
        meta: { description: 'Schema' },
        children: [
          {
            path: 'edit/:id',
            component: SchemaNew,
            name: 'schema/edit',
            meta: { description: 'Schema' },
            props: {
              id: String,
              required: true
            }
          },
          {
            path: '',
            component: SchemaList,
            meta: { description: 'Schema' }
          },
          {
            path: 'new',
            component: SchemaNew,
            name: 'schema/new',
            meta: { description: 'Schema' }
          },
          {
            path: ':id/mapping',
            component: SchemaMapping,
            name: 'schema/mapping',
            meta: { description: 'SchemaMappingList' },
            props: {
              id: Number,
              required: false
            },
            children: [
              {
                path: '', // http://localhost:8000/schema/f25db232-6985-45ea-8316-5c534e0d4e28/mapping
                component: SchemaMappingList,
                name: 'schema/mapping/list',
                meta: { description: 'SchemaMappingList' },
                props: {
                  id: Number,
                  required: false
                }
              },
              {
                path: 'new',
                component: SchemaMappingNew,
                name: 'schema/mapping/new',
                meta: { description: 'SchemaMapping' },
                props: {
                  id: Number,
                  required: false
                }
              },
              {
                path: 'edit/:mappingid',
                component: SchemaMappingNew,
                name: 'schema/mapping/edit',
                meta: { description: 'SchemaMappingEdit' },
                props: {
                  id: Number,
                  required: false
                }
              }
            ]
          }
        ]
      },
      { // Flow
        path: 'flow',
        component: Flow,
        name: 'flow',
        meta: { description: 'Flow' },
        children: [
          {
            path: '',
            name: 'flow/list',
            component: FlowzList,
            meta: { description: 'Flow' }
          },
          {
            path: 'analytics/:id',
            alias: '',
            component: Analytics,
            name: 'Analytics',
            props: {
              id: String
            }
          },
          {
            path: 'flowoverview/:id',
            alias: '',
            component: FlowOverview,
            name: 'FlowOverview',
            props: {
              id: String
            }
          },
          {
            path: 'new',
            component: FlowNew,
            name: 'flow/new',
            meta: { description: 'New' }
          },
          {
            path: 'edit/:id',
            component: FlowNew,
            name: 'flow/edit',
            meta: { description: 'Edit' },
            props: {
              id: Number,
              required: false
            }
          },
          {
            path: 'instance/:id',
            component: flowInstance,
            name: 'flow/instance',
            meta: { description: 'Flowz Instance' },
            props: {
              id: Number,
              required: false
            }
          },
          {
            path: 'instance/log/:id',
            component: flowLog,
            name: 'flow/systemlog',
            meta: { description: 'Flowz Instance systemlog' }
          }
        ]
      },
      { // SchemaView
        path: 'schemaview/:id/:stateid',
        name: 'schemaview',
        component: SchemaView,
        props: {
          stateid: String,
          required: false
        }
      }
    ]
  },
  {
    path: '/',
    name: 'userLayout',
    component: Layout,
    meta: { requiresAuth: true, role: [2] },
    children: [
      {
        path: 'dashboard',
        alias: '',
        component: Dashboard,
        name: 'userDashboard'
      },
      {
        path: '/schemaview/:id/:stateid',
        name: 'userSchemaview',
        component: SchemaView,
        props: {
          stateid: String,
          required: false
        }
      }
    ]
  },
  {
    path: '/Login',
    name: 'Login',
    component: Login
  },
  {
    path: '/Register',
    name: 'Register',
    component: Register
  }
]
export default mroutes
