<template>
  <div class="instancelist">
  	<!-- <f-Tab></f-Tab> -->
      <Row>
        <Col span="20">
          <h5>Schema Mapping List</h5>
        </Col>
        <Col span="4">
          <router-link :to="{name: 'schema/mapping/new', params: {id: $route.params.id}}">
            <Button type="primary" style="float:right" size="small" icon="plus-round">Add</Button>
          </router-link>
        </Col>
      </Row>
    <Table border :columns="columns5" :data="data5"></Table>
  </div>
</template>
<script>
/*eslint-disable*/
import api from '@/api'
import Schema from '@/api/schema'
import schemamapping from '@/api/schemamapping'
// import Tab from './Tab'
import expandRow from '@/components/erow_mappinglist.vue'
export default {
  name: 'instancelist',
  components: {
    // 'f-Tab': Tab,
    'expandRow': expandRow
  },
  computed: {
  },
  created () {
    this.fetch(this.$route.params.id)
  },
  data () {
    return {
      columns5: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(expandRow, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          title: 'Mapping Title',
          key: 'title',
          sortable: true
        },
        {
          title: 'Producer',
          key: 'producer'
        },
        {
          title:'Consumer',
          key: 'consumer'
        },
        {
          title: 'Notes',
          key: 'notes'
        },
        {
          title: 'Action',
          key: 'action',
          width: 400,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'edit'
                },
                style: {
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px',
                  color: '#00C851'
                },
                on: {
                  click: () => {
                    this.show(this.$route.params.id,params.row.id)
                  }
                }
              }, ''),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'trash-b'
                },
                style: {
                  color: '#CC0000',
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px'
                },
                on: {
                  click: () => {
                    this.remove(params.index)
                  }
                }
              }, '')
            ])
          }
        }
      ],
      data5: []
    }
  },
  methods: {
    fetch (id) {
      var self = this
      // alert(id)
      schemamapping.get()
      .then(response => {
        // console.log('response', response.data.data)
        self.data5 = []
        response.data.data.forEach(function (result, i) {
          if (result.producer === self.$route.params.id) {
            Schema.getThis(result.producer)
            .then(res => {
              result.producer = res.data.title
            })
            Schema.getThis(result.consumer)
            .then(res => {
              result.consumer = res.data.title
            })
            self.data5.push(result)
          }
        })
      })
      .catch(error => {
        console.log(error)
      })
    },
    show (schemaId,mappingId) {
    	 this.$router.push('/schema/'+ schemaId + '/mapping/edit/' + mappingId)
    },
    remove (index) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete?</p>',
        onOk: () => {
          schemamapping.deleteThis(this.data5[index].id)
            .then(response => {
          		this.data5.splice(index, 1)
    		      this.$Notice.success({
    		          title: 'Success',
    		          desc: 'SchemaInstance Deleted.....',
    		          duration: 2
    		      })
            })
            .catch(error => {
              console.log(error)
              this.$Notice.error({
    		          title: 'Error',
    		          desc: 'SchemaInstance Not Deleted.....',
    		          duration: 2
    		      })
            })
        },
        onCancel: () => {
        }
      })
    }
  },
  watch: {
    '$route.params.id' (newId, oldId) {
      // fetch data
      this.fetch(newId)
    }
  }
}
</script>
<style>
	.ivu-table th {
    height: 44px;
    white-space: nowrap;
    overflow: hidden;
    background-color: #394263;
    color: #fff;
}
</style>