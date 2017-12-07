<template>
  <div>
    <Row type="flex" justify="end">
      <Col>
        <Button type="primary" icon="plus" style="margin-bottom: 2px;" @click="addApproval" size="small">Add</Button>
      </Col>
    </Row>
    <Row>
      <Col>
        <Table size="small" :columns="approvalCol" :data="approvalData"></Table>
      </Col>
    </Row>
  </div>
</template>

<script>
  /* eslint-disable*/
  import $ from 'jquery'
  import expandRowView from '@/pages/approval/View.vue';
  import approval from '@/api/approval'

  export default{
      components: { expandRowView },
      data () {
        return {
          approvalCol: [
              {
                type: 'expand',
                width: 20,
                render: (h, params) => {
                    return h(expandRowView, {
                        props: {
                            row: params.row
                        }
                    })
                }
              },
              {
                  title: 'Approval',
                  width: '90%',
                  key: 'proccessname'
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
                          icon: 'edit'
                        },
                        style: {
                          color: '#CC0000',
                          marginRight: '3px',
                          padding: '0px',
                          fontSize: '20px'
                        },
                        on: {
                          click: () => {
                            this.edit(params.row.id)
                          }
                        }
                      }, ''),
                    /*  h('Button', {
                        type: 'expand',
                        props: {
                          type: 'text',
                          size: 'large',
                          icon: 'eye'
                        },
                        style: {
                          color: '#CC0000',
                          marginRight: '3px',
                          padding: '0px',
                          fontSize: '20px'
                        },
                        on: {
                          click: () => {
                            this.viewRow(params.row.id)
                          }
                        }
                      }, ''), */
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
                            this.removeRow(params.row.id,params.index)
                          }
                        }
                      }, '')
                    ])
                  }
              }
          ],
          approvalData:[]
        }
      },
      mounted:function () {
        this.getapproval()
      },
      methods:{
        getapproval: async function(){
          this.approvalData = await approval.get()
          console.log(this.approvalData)
        },
        addApproval: function(){
          this.$router.push('approval/new')
        },
        edit: function(rowId){
          this.$router.push('approval/edit/' + rowId)
        },
        removeRow: function(rowId,index){
          this.$Modal.confirm({
            title: 'Confirm Delete',
            content: '<p>Are you sure you want to delete row?</p>',
            onOk: async() => {
                var actionResponse = await approval.delete(rowId)
                if(actionResponse.status == 'success'){
                  this.approvalData.splice(index, 1);
                  this.$Notice.success({duration:3, title:'Success!!', desc:actionResponse.message})
                }
                else{
                  this.$Notice.error({duration:3, title:'Error!!', desc:actionResponse.message})
                }
            },
            onCancel: () => {
            }
          });
        }
      }
  }
</script>
<style scoped>
    .layout{
        border: 1px solid #d7dde4;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
    }
    .layout-header{
        height: 60px;
        background: #f5f7f9;
        box-shadow: 0 1px 1px rgba(0,0,0,.1);
        padding: 15px
    }
</style>
