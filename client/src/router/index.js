import Vue from 'vue'
import VueRouter from 'vue-router'
// Layout
import Layout from '@/layout/Master'
import userLayout from '@/layout/user/Master'
// userLayout
// import userLayout from '@/userLayout/Master'
// Area
import Dashboard from '@/area/Dashboard'
import Flow from '@/area/Flow'
import DbSettings from '@/area/DbSettings'
import Schema from '@/area/Schema'
import Approval from '@/area/Approval'
// Schema area
import SchemaMapping from '@/pages/schema/Mapping'
import SchemaMappingNew from '@/pages/schema/mapping/New'
import SchemaMappingList from '@/pages/schema/mapping/List'
import SchemaList from '@/pages/schema/schemaList'
// Flow area
import FlowzList from '@/pages/flow/List'
import FlowNew from '@/pages/flow/New'
import flowInstance from '@/pages/flow/instance/New'
import flowLog from '@/pages/flow/systemLog'
// DbSettings area
import DbSettingsList from '@/pages/dbSettings/List'
import DbSettingsNew from '@/pages/dbSettings/New'
import SchemaNew from '@/pages/schema/New'
// pages
import Login from '@/pages/Login'
import Register from '@/pages/Register'
// Approval area
import ApprovalList from '@/pages/approval/List'
import ApprovalNew from '@/pages/approval/New'
import Reply from '@/pages/approval/MailReply'
// User area
// import UserDashboard from '@/pages/user/dashboard'
// import ManageBPMNPlugin from '@/pages/BPMNPlugins/Manage'

import UserDashboard from '@/pages/user/dashboard'
// import UserProcesslist from '@/pages/user/processlist'
import ManageBPMNPlugin from '@/pages/BPMNPlugins/Manage'
Vue.use(VueRouter)
const routes = [{
  path: '/admin',
  name: 'Layout',
  component: Layout,
  meta: { requiresAuth: true, role: [1] },
  children: [{
    path: 'dashboard',
    alias: '',
    component: Dashboard,
    name: 'Dashboard'
  }, { // Plugin
    path: 'bpmn-plugin',
    component: ManageBPMNPlugin,
    name: 'bpmn-plugin',
    meta: { description: 'Schema' }
  }, { // Schema
    path: 'schema',
    component: Schema,
    name: 'schema',
    meta: { description: 'Schema' },
    children: [{
      path: 'edit/:id',
      component: SchemaNew,
      name: 'schema/edit',
      meta: { description: 'Schema' },
      props: {
        id: String,
        required: true
      }
    }, {
      path: '',
      component: SchemaList,
      meta: { description: 'Schema' }
    }, {
      path: 'new',
      component: SchemaNew,
      name: 'schema/new',
      meta: { description: 'Schema' }
    }, {
      path: ':id/mapping',
      component: SchemaMapping,
      name: 'schema/mapping',
      meta: { description: 'SchemaMappingList' },
      props: {
        id: Number,
        required: false
      },
      children: [{
        path: '', // http://localhost:8000/schema/f25db232-6985-45ea-8316-5c534e0d4e28/mapping
        component: SchemaMappingList,
        name: 'schema/mapping/list',
        meta: { description: 'SchemaMappingList' },
        props: {
          id: Number,
          required: false
        }
      }, {
        path: 'new',
        component: SchemaMappingNew,
        name: 'schema/mapping/new',
        meta: { description: 'SchemaMapping' },
        props: {
          id: Number,
          required: false
        }
      }, {
        path: 'edit/:mappingid',
        component: SchemaMappingNew,
        name: 'schema/mapping/edit',
        meta: { description: 'SchemaMappingEdit' },
        props: {
          id: Number,
          required: false
        }
      }]
    }]
  }, { // Flow
    path: 'flow',
    component: Flow,
    name: 'flow',
    meta: { description: 'Flow' },
    children: [{
      path: '',
      component: FlowzList,
      meta: { description: 'Flow' }
    }, {
      path: 'new',
      component: FlowNew,
      name: 'flow/new',
      meta: { description: 'New' }
    }, {
      path: 'edit/:id',
      component: FlowNew,
      name: 'flow/edit',
      meta: { description: 'Edit' },
      props: {
        id: Number,
        required: false
      }
    }, {
      path: 'instance/:id',
      component: flowInstance,
      name: 'flow/instance',
      meta: { description: 'Flowz Instance' },
      props: {
        id: Number,
        required: false
      }
    }, {
      path: 'instance/log/:id',
      component: flowLog,
      name: 'flow/systemlog',
      meta: { description: 'Flowz Instance systemlog' }
    }]
  }, { // DB Settings
    path: 'DbSettings',
    name: 'DbSettings',
    component: DbSettings,
    children: [{
      path: '',
      name: 'list',
      component: DbSettingsList
    }, {
      path: ':db/new',
      name: 'DbSettings/new',
      component: DbSettingsNew
    }]
  }, { // Approval
    path: 'approval',
    name: 'Approval',
    component: Approval,
    children: [{
      path: '',
      name: 'Approval/list',
      component: ApprovalList
    }, {
      path: 'new',
      name: 'Approval/new',
      component: ApprovalNew,
      meta: { description: 'New' }
    }, {
      path: 'edit/:id',
      name: 'Approval/edit',
      component: ApprovalNew,
      meta: { description: 'Edit' },
      props: {
        id: String,
        required: false
      }
    }, {
      path: '/mail/reply/:mailid/:pid/:jobid/:fiid',
      name: 'mail/reply',
      component: Reply
    }]
  }]
}, { // Enduser Dashboard
  path: '/',
  name: 'User',
  component: userLayout,
  meta: { requiresAuth: true, role: [2, 3] },
  children: [{
    path: '/',
    name: 'approval',
    component: UserDashboard,
    meta: { description: 'DashBoard' }
  }, {
    path: 'approval/:id',
    name: 'Process',
    component: UserDashboard,
    meta: { description: 'List' },
    props: {
      id: String,
      required: false
    }
  }]
    // }, {
    //   path: 'approval/:id',
    //   name: 'Process',
    //   component: UserProcesslist,
    //   meta: { description: 'List' },
    //   props: {
    //     id: String,
    //     required: false
    //   }
    // }]
}, {
  path: '/Login',
  name: 'Login',
  component: Login
}, {
  path: '/Register',
  name: 'Register',
  component: Register
}]
export default routes
