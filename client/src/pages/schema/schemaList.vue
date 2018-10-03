<template>
  <div>
    <Row type="flex" justify="end" >
      <div style="font-size:14px">Total: <b> {{ total }} </b> &nbsp;&nbsp;&nbsp;</div style="">
      <router-link :to="{name:'schema/new'}">
        <Button type="primary" size="small"  style="margin-bottom: 4px;" icon="plus">Add</Button>
      </router-link>
    </Row>
    <Row>
      <Table size="small" :loading="loading" :columns="schemaCol" :data="schemaData"></Table>
    </Row>
    <Row style="margin-top: 4px; float: right">
      <Page :total="total" :current="cpage" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
    </Row>
  </div>
</template>
<script type="text/javascript">
  import schemaModel from '@/api/schema'
  import moment from 'moment'
  export default {
    data () {
      return {
        loading: false,
        schemaData: [],
        limit: 10,
        cpage: 1,
        skip: 0,
        total: 0,
        deleteSchemaValue: 'softdel',
        schemaCol: [
          {
            title: 'Title',
            key: 'title',
            sortable: true
          },
          {
            title: 'ID',
            key: 'id'
          },
          {
            title: 'Created',
            key: 'createdAt',
            render: (h, params) => {
              if (params.row.createdAt !== undefined) {
                return h('div', [
                  h('Tooltip', {
                    props: {
                      content: params.row.createdAt
                    }
                  }, moment(params.row.createdAt).format('lll'))
                ])
              } else {
                return h('div', '--')
              }
            }
          },
          {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'large',
                    icon: 'ios-compose-outline'
                  },
                  style: {
                    color: '#3352FF',
                    marginRight: '3px',
                    padding: '0px',
                    fontSize: '20px'
                  },
                  on: {
                    click: () => {
                      this.$router.push('schema/edit/' + this.schemaData[params.index].id)
                    }
                  }
                }, ''),
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'large',
                    icon: 'android-delete'
                  },
                  style: {
                    color: '#CC0000',
                    marginRight: '3px',
                    padding: '0px',
                    fontSize: '20px'
                  },
                  on: {
                    click: () => {
                      // console.log('removed')
                      this.handleRemove(params.index)
                    }
                  }
                }, '')
              ])
            }
          }
        ]
      }
    },
    methods: {
      handlePage (page) {
        this.cpage = page
        this.skip = (page * this.limit) - this.limit
        this.init()
      },
      handlePagesize (size) {
        this.limit = size
        this.skip = 0
        this.init()
      },
      handleRemove (index) {
        this.$Modal.confirm({
          title: 'Confirm, Are you sure you want to delete?',
          // content: '<p>Are you sure you want to delete?</p>',
          width: 500,
          render: (h, params) => {
            return h('RadioGroup', {
              props: {
                vertical: true,
                value: this.deleteSchemaValue,
                size: 'large'
              },
              style: {
                paddingTop: '20px'
              },
              on: {
                'on-change': (value) => {
                  this.deleteSchemaValue = value
                }
              }
            }, [
              h('Radio', {
                props: {
                  size: 'large',
                  label: 'harddel'
                }
              }, 'Delete Schema Permanently?? (With all instance Data)'),
              h('Radio', {
                props: {
                  size: 'large',
                  label: 'softdel'
                }
              }, 'Delete Schema Temporary? (Without instance Data)')
            ])
          },
          onOk: () => {
            if (this.deleteSchemaValue === 'softdel') {
              schemaModel.patch(this.schemaData[index].id, {isdeleted: true})
                .then(response => {
                  this.$Notice.success({title: 'Success!!', desc: 'Schema Deleted...'})
                  this.total--
                  this.schemaData.splice(index, 1)
                })
                .catch(error => {
                  this.$Notice.error({title: 'Error!!', desc: 'Schema Not Deleted...'})
                  console.log(error)
                })
            } else if (this.deleteSchemaValue === 'harddel') {
              schemaModel.delete(this.schemaData[index].id)
                .then(response => {
                  this.total--
                  this.schemaData.splice(index, 1)
                })
                .catch(error => {
                  console.log(error)
                })
            } else {
              this.$Message.error('Error!!')
            }
          },
          onCancel: () => {
            this.deleteSchemaValue = 'softdel'
          }
        })
      },
      async init () {
        // var string = '&$skip=' + this.skip + '&$limit=' + this.limit
        this.loading = true
        this.schemaData = await (schemaModel.get(null, {
          isdeleted: false,
          '$sort[createdAt]': -1,
          $skip: this.skip,
          $limit: this.$limit,
          subscriptionId: this.$store.state.subscription,
          userId: this.$store.state.user._id
        }).then(res => {
          this.loading = false
          this.total = res.data.total
          return res.data.data
        }).catch(err => {
          console.log(err)
          this.$Notice.error({duration: '3', title: err.message, desc: ''})
          this.loading = false
          return []
        }))
      }
    },
    mounted () {
      this.init()
    },
    feathers: {
      'schema': {
        created (data) {
          this.init()
        },
        updated (data) {
        },
        removed (data) {
        }
      }
    }
  }
</script>
