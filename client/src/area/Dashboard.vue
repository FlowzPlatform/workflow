<template>
  <div class="dashboard">
    Dashboard
  </div>
</template>

<script>
export default {
  name: 'dashboard'
}
</script>

<!-- <template>
    <Form ref="formDynamic" :model="formDy" :label-width="80">
        <FormItem
            v-for="(item, index) in formDy.items"
            :key="index"
            :label="'name ' + (index + 1)"
            :prop="'items.' + index + '[' + "'candidate name'" + ']'"
            :rules="{required: true, message: 'name' + (index + 1) +'required', trigger: 'blur'}">
            <Row>
                <Col span="18">
                    <Input type="text" v-model="item['candidate name']" placeholder="Enter..."></Input>
                </Col>
                <Col span="4" offset="1">
                    <Button type="ghost" @click="handleRemove(index)">Del</Button>
                </Col>
            </Row>
        </FormItem>
        <FormItem>
            <Row>
                <Col span="12">
                    <Button type="dashed" long @click="handleAdd('formDynamic')" icon="plus-round">Add</Button>
                </Col>
            </Row>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="handleSubmit('formDynamic')">Submit</Button>
            <Button type="ghost" @click="handleReset('formDynamic')" style="margin-left: 8px">Cancel</Button>
        </FormItem>
    </Form>
</template>
<script>
    export default {
      name: 'dashboard',
      data () {
        return {
          formDy: {
            items: [
              {
                'candidate name': ''
              }
            ]
          }
        }
      },
      methods: {
        handleSubmit (name) {
          // alert(name)
          this.$refs[name].validate((valid) => {
            if (valid) {
              this.$Message.success('Success!')
            } else {
              this.$Message.error('Error!')
            }
          })
        },
        handleReset (name) {
          this.$refs[name].resetFields()
        },
        handleAdd (name) {
          // console.log('this.$refs[name]', this.$refs[name])
          this.$refs[name].validate((valid) => {
            // alert(valid)
            if (valid) {
              // this.$Message.success('Success!')
              this.formDy.items.push({
                'candidate name': ''
              })
            } else {
              this.$Message.error('Error!')
            }
          })
        },
        handleRemove (index) {
          this.formDy.items.splice(index, 1)
        }
      }
    }
</script> -->