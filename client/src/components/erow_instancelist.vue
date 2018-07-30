<template>
    <div>
        <Row class="expand-row">
          <Table border :columns="columns5" :data="data5" size="small"></Table>
        </Row>
    </div>
</template>
<script>
/*eslint-disable*/
    export default {
      name: 'erow_instancelist',
      props: {
        row: Object
      },
      data () {
        return {
          columns5: [
            {
              title: 'Instance Title',
              key: 'name'
            }
          ],
          data5: [
          ]
        }
      },
      mounted () {
        var self = this
        this.columns5 = []
        this.row.entity.forEach(function (k, i) {
          // console.log({title: k.name, key: k.name})
          self.columns5.push({title: k.name, key: k.name})
        })
        this.data5 = []
        this.row.data.options.forEach(function (result, i) {
          // console.log('result', result)
          var obj = {}
          self.row.entity.forEach(function (ent, inx) {
            obj[ent.name] = result[ent.name]
            // console.log(result[ent.name], obj)
          })
          self.data5.push(obj)
        })
      }
    }
</script>
