<style scoped>
    .expand-row{
        margin-bottom: 16px;
    }
</style>
<template>
    <div>
        <Row class="expand-row">
          <schema-instance :id="row.inputProperty[0].entityschema.id" :processid="row.id" :instanceid="$route.params.id" :lastLog="lastLog"></schema-instance>
        </Row>
    </div>
</template>
<script>
  import SchemaInstance from './SchemaInstance.vue'
  export default {
    components: {'schema-instance': SchemaInstance},
    props: {
      row: Object,
      lastLog: Object
    }
  }
</script>