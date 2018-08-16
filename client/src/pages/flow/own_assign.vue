<template>
    <div>
        <div v-if = 'data7.length > 0'>
            <Table border :columns="columns7" :data="data7"></Table>
        </div>
        <div v-else style="text-align:center;color:#fd5e5e">
            <h5>No one is assigned</h5>
        </div>
    </div>
</template>

<script>
  export default {
    props: {
      row: Object
    },
    data () {
      return {
        columns7: [
          {
            title: 'Module',
            key: 'module',
            render: (h, params) => {
              return h('div', [
                h('strong', this.capitalize(Object.keys(params.row)[0]))
              ])
            }
          },
          {
            title: 'Role',
            key: 'role',
            render: (h, params) => {
              return h('div', [
                h('strong', this.capitalize(params.row[Object.keys(params.row)[0]]))
              ])
            }
          }
        ],
        data7: []
      }
    },
    methods: {
      capitalize (str) {
        str = str[0].toUpperCase() + str.slice(1)
        return str
      },
      async init () {
        let self = this
        for (let role in this.row.role) {
          self.data7.push({[role]: this.row.role[role]})
        }
      }
    },
    mounted () {
      this.init()
    }
  }
</script>
