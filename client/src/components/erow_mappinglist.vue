<template>
    <div>
        <Row class="expand-row">
          <Table border :columns="columns" :data="mapdata" size="small"></Table>
        </Row>
    </div>
</template>
<script>
/*eslint-disable*/
    export default {
      name: 'erow_mappinglist',
      props: {
        row: Object
      },
      data () {
        return {
          columns: [
            {
              title: 'Producer Field',
              key: 'producerField'
            },
            {
              title: 'Consumer Field',
              key: 'consumerField'
            },
            {
              title: 'Transform',
              key: 'transform'
            }
          ],
          mapdata: []
        }
      },
      mounted () {
        var self = this
        this.mapdata = []
        console.log(this.row)
        _.forEach(this.row.MapData, function (result, i) {
          self.mapdata.push(result)
          if (Array.isArray(result.consumerField)) {
            self.mapdata[i].consumerField = result.consumerField.join('/')
          }
        })
      }
    }
</script>
