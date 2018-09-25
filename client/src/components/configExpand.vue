<template>
  <div class="ConfigExpand">
  	<div>
        <Row class="expand-row">
            <Form>
              <FormItem>
                <Checkbox>Start Date</Checkbox>
              </FormItem>
              <FormItem>
                <Checkbox>End Date</Checkbox>
              </FormItem>
              <FormItem>
                <Checkbox>Duration</Checkbox>
              </FormItem>
            </Form>
        </Row>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ConfigExpand',
  props: {
    row: {
      type: Object
    }
  },
  data () {
    return {
      name: ''
    }
  },
  component: {
  },
  methods: {

  },
  mounted () {

  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
