<template>
	<div class="SchemaList">
    <div v-if="configuration" style="">
      <Button @click="handleConfiguration" ghost>Configuration</Button>
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
      <Table :columns="setColumns" :data="mdata" :border="config.border" :stripe="config.stripe"></Table>
    </div>
	</div>
</template>
<script>
  export default {
    name: 'schemalist',
    props: {
      'schema': Object,
      'data': Array,
      'configuration': Boolean
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
            this.dataConfig.push({
              title: item.name,
              key: item.name,
              show: true,
              sortable: false,
              width: 150
            })
          }
        }
        return this.dataConfig
      },
      setColumns () {
        const cols = []
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
    },
    methods: {
      handleConfiguration () {
        this.isShow = !this.isShow
      }
    }
  }
</script>
