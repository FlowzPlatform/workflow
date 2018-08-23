<template>
	<div class="SchemaList">
    <div v-if="configuration" style="">
      <Button style="float: right; margin-top: -50px;" @click="handleConfiguration" ghost><i class="fa fa-cog"></i></Button>
      <Modal v-model="isShow" title="Set Configuration" width="750px"  style="">
        <div style="margin: 10px">
          Display border <i-switch v-model="config.border" style="margin-right: 5px"></i-switch>
          Display stripe <i-switch v-model="config.stripe" style="margin-right: 5px"></i-switch>
          Display index <i-switch v-model="config.index" style="margin-right: 5px"></i-switch>
        </div>
        <div>
            <Table :columns="colConfig" :data="configData"></Table>
        </div>
      </Modal>
    </div>
    <div>
      <Table :columns="setColumns" :data="data" :border="config.border" :stripe="config.stripe"></Table>
    </div>
	</div>
</template>
<script>
  // import finstanceModal from '@/api/finstance'
  // import flowzModal from '@/api/flowz'
  import flowzdataModal from '@/api/flowzdata'

  import _ from 'lodash'
  export default {
    name: 'schemalist',
    props: {
      'schema': Object,
      'data': Array,
      'configuration': Boolean,
      'dynamicData': Boolean,
      'flowzData': Object,
      'instanceEntries': Array
    },
    data () {
      return {
        dataConfig: [],
        isShow: false,
        mdata: [],
        config: {
          border: true,
          stripe: true,
          index: false
        },
        colConfig: [
          {
            title: 'Field Name',
            key: 'key'
          },
          {
            title: 'Show',
            key: 'show',
            render: (h, params) => {
              return h('div', [
                h('Checkbox', {
                  props: {
                    value: params.row.show
                  },
                  on: {
                    'on-change': (value) => {
                      // console.log('show', value)
                      this.configData[params.index].show = !this.configData[params.index].show
                    }
                  }
                })
              ])
            }
          },
          {
            title: 'Sortable',
            key: 'sortable',
            render: (h, params) => {
              return h('div', [
                h('Checkbox', {
                  props: {
                    value: params.row.sortable
                  },
                  on: {
                    'on-change': (value) => {
                      // console.log('sortable', value)
                      this.configData[params.index].sortable = !this.configData[params.index].sortable
                    }
                  }
                })
              ])
            }
          },
          {
            title: 'Width',
            key: 'width',
            render: (h, params) => {
              return h('div', [
                h('input', {
                  props: {
                  },
                  attrs: {
                    class: 'form-control',
                    type: 'number',
                    value: params.row.width
                  },
                  on: {
                    'keyup': (event) => {
                      // console.log('value', event.target.value, event.keyCode)
                      if (event.target.value && event.target.value !== null && event.keyCode === 13) {
                        if (event.target.value <= 0) {
                          this.configData[params.index].width = 150
                        } else {
                          this.configData[params.index].width = parseInt(event.target.value)
                        }
                      }
                    }
                  }
                })
              ])
            }
          }
        ]
      }
    },
    computed: {
      configData () {
        this.dataConfig = []
        if (this.schema.hasOwnProperty('entity')) {
          for (let item of this.schema.entity) {
            let isshow = true
            if (item.customtype) {
              isshow = false
            }
            this.dataConfig.push({
              title: item.name,
              key: item.name,
              show: isshow,
              sortable: false,
              width: 150
            })
          }
        }
        return this.dataConfig
      },
      setColumns () {
        const cols = []
        if (this.dynamicData) {
          cols.push({
            title: 'Action',
            width: 100,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    shape: 'circle',
                    icon: 'ios-play'
                  },
                  on: {
                    'click': async () => {
                      this.$Spin.show()
                      let indexFind = _.findIndex(this.instanceEntries, (o) => { return o.id === params.row.id })
                      // console.log('indexfind: ', indexFind)
                      // this.$emit('setValues', this.instanceEntries[indexFind])
                      // console.log('Click: ', params.row, params.index)
                      console.log('this.flozdata: ', this.flowzData)
                      let currentObj = _.find(this.flowzData.json.processList, {id: this.instanceEntries[indexFind].currentStatus})
                      console.log('currentObj: ', currentObj)
                      let values = {
                        id: currentObj.inputProperty[0].entityschema.id,
                        item: this.instanceEntries[indexFind],
                        formName: currentObj.name,
                        currentState: currentObj.id,
                        flowzData: this.flowzData,
                        formData: {}
                        // nextState: resp[currentState].next,
                        // currentState: currentState
                      }
                      // console.log('_____________values', item)
                      if (this.instanceEntries[indexFind].stageReference.length > 0) {
                        let lastObj = this.instanceEntries[indexFind].stageReference[this.instanceEntries[indexFind].stageReference.length - 1]
                        await flowzdataModal.get(lastObj.stageRecordId).then(res => {
                          values.formData = res.data.data
                          this.$Spin.hide()
                        }).catch(err => {
                          console.log('previous data getting error', err)
                          this.$Spin.hide()
                        })
                      }
                      await this.$emit('setValues', values)
                    }
                  }
                }, '')
              ])
            }
          })
          cols.push({
            title: 'ID',
            key: 'id',
            width: 260
          })
        }
        if (this.configuration) {
          if (this.config.index) {
            cols.push({
              type: 'index',
              width: 60,
              align: 'center'
            })
          }
          for (let item of this.dataConfig) {
            if (item.show) {
              cols.push({
                title: item.title,
                key: item.key,
                sortable: item.sortable,
                width: item.width
              })
            }
          }
        } else {
          if (this.schema.hasOwnProperty('entity')) {
            for (let item of this.schema.entity) {
              cols.push({
                title: item.name,
                key: item.name,
                width: 150
              })
            }
          }
        }
        return cols
      }
    },
    mounted () {
      this.mdata = this.data
      console.log('dynamicData: ', this.dynamicData)
      console.log('this.schema: ', this.data)

      // if (this.dynamicData) {
      //   await flowzModal.get(id, {
      //     $select: ['json']
      //   }).then(async res => {
      //     this.flowzData = res.data
      //     await finstanceModal.get(null, query).then(resp => {
      //       this.instanceEntries = resp.data
      //     }).catch(err => {
      //       this.instanceEntries = null
      //       console.log('err', err)
      //     })
      //   }).catch(err => {
      //     this.instanceEntries = null
      //     console.log('....', err)
      //   })
      // }
    },
    methods: {
      handleConfiguration () {
        this.isShow = !this.isShow
      }
    }
  }
</script>
