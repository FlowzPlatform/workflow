import Vue from 'vue'
import VueRouter from 'vue-router'

// Master Layout
import Layout from '@/masterLayout/Master'

// Login
import Login from '@/pages/Login'
import Register from '@/pages/Register'

// Area
import Dashboard from '@/area/Dashboard'
import Flow from '@/area/Flow'
import Schema from '@/area/Schema'

// Schema area
import SchemaList from '@/pages/schema/schemaList'
import SchemaNew from '@/pages/schema/New'

// Flow area
import FlowzList from '@/pages/flow/List'
import FlowNew from '@/pages/flow/New'
import Analytics from '@/pages/flow/analytics'

import ManageBPMNPlugin from '@/pages/BPMNPlugins/Manage'
import SchemaView from '@/components/SchemaView'

import emailTemplateList from '@/pages/emailTemplate/emailTemplateList'
import editEmailTemplate from '@/pages/emailTemplate/editEmailTemplate'
import createEmailTemplate from '@/pages/emailTemplate/createEmailTemplate'

// import emailtemplate from '@/components/emailtemplate'
// import editEmailTemplate from '@/components/editEmailTemplate'
import emailTemplateCreate from '@/components/emailTemplateCreate'

import permission from '@/components/permission'

// const tagSpinner = resolve => require(['./spinner'], resolve)

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
        meta: { description: 'bpmn-plugin' }
      },
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
            meta: { description: 'Schema/edit' },
            props: {
              id: String,
              required: true
            }
          },
          {
            path: '',
            component: SchemaList,
            name: 'schema/list',
            meta: { description: 'Schema/list' }
          },
          {
            path: 'new',
            component: SchemaNew,
            name: 'schema/new',
            meta: { description: 'Schema/new' }
          }
        ]
      },
      { // Emailtemplate List
        path: 'emailtemplate',
        component: emailTemplateList,
        name: 'emailtemplate',
        meta: { description: 'emailtemplate' }
        // children: [
        //   {
        //     path: 'edit/:id',
        //     component: editEmailTemplate,
        //     name: 'emailtemplate/edit',
        //     meta: { description: 'Edit' },
        //     props: {
        //       id: Number,
        //       required: false
        //     }
        //   }
        // ]
      },
      { // Emailtemplate
        path: 'emailtemplate/edit/:id',
        component: editEmailTemplate,
        name: 'editemailtemplate',
        meta: { description: 'emailtemplate' },
        props: true
      },
      { // Emailtemplate
        path: 'emailtemplate/new',
        component: emailTemplateCreate,
        name: 'createemailtemplate',
        meta: { description: 'emailtemplate' },
        props: true
      },
      { // Emailtemplate edit
        path: 'emailtemplate/edit/:id',
        component: editEmailTemplate,
        name: 'editemailtemplate',
        meta: { description: 'emailtemplate' },
        props: true
      },
      { // Emailtemplate create
        path: 'emailtemplate/new',
        component: createEmailTemplate,
        name: 'createemailtemplate',
        meta: { description: 'emailtemplate' },
        props: true
      },
      { // permission
        path: 'permission/:id',
        component: permission,
        name: 'permission',
        meta: { description: 'permission' },
        props: {
          id: Number,
          required: true
        }
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
          }
        ]
      },
      { // SchemaView
        path: 'view/:id/:stateid',
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
        path: '/view/:id/:stateid',
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
