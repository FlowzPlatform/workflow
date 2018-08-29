<template>
  <div class="dashboard">
    Dashboard {{$store.state.role}}
    <div v-if="$store.state.role === 1">
      <div class="row">
        <div class="col-md-3">
          <div class="card-counter primary">
            <i class="fa fa-code-fork"></i>
            <span class="count-numbers">{{countFlowz}}</span>
            <span class="count-name">Flowz</span>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card-counter danger">
            <i class="fa fa-ticket"></i>
            <span class="count-numbers">{{countInstances}}</span>
            <span class="count-name">Instances</span>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card-counter success">
            <i class="fa fa-database"></i>
            <span class="count-numbers">{{countData}}</span>
            <span class="count-name">Data</span>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card-counter info">
            <i class="fa fa-users"></i>
            <span class="count-numbers">{{countUsers}}</span>
            <span class="count-name">Users</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import flowzModel from '../api/flowz'
import finstanceModel from '../api/finstance'
import flowzDataModel from '../api/flowzdata'
export default {
  name: 'dashboard',
  data () {
    return {
      countFlowz: null,
      countInstances: null,
      countData: null,
      countUsers: null
    }
  },
  methods: {
    init () {
      flowzModel.get(null, {})
      .then((res) => { 
        this.countFlowz = res.data.total 
      })
      
      finstanceModel.get(null, {})
      .then((res) => { 
        this.countInstances = res.data.total 
      })

      flowzDataModel.get(null, {})
      .then((res) => { 
        console.log('resp data:', res)
        this.countData = res.total 
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
<style scoped>
  .card-counter{
    box-shadow: 2px 2px 10px #DADADA;
    margin: 5px;
    padding: 20px 10px;
    background-color: #fff;
    height: 100px;
    border-radius: 5px;
    transition: .3s linear all;
  }

  .card-counter:hover{
    box-shadow: 4px 4px 20px #DADADA;
    transition: .3s linear all;
  }

  .card-counter.primary{
    background-color: #007bff;
    color: #FFF;
  }

  .card-counter.danger{
    background-color: #ef5350;
    color: #FFF;
  }  

  .card-counter.success{
    background-color: #66bb6a;
    color: #FFF;
  }  

  .card-counter.info{
    background-color: #26c6da;
    color: #FFF;
  }  

  .card-counter i{
    font-size: 5em;
    opacity: 0.2;
  }

  .card-counter .count-numbers{
    position: absolute;
    right: 35px;
    top: 20px;
    font-size: 32px;
    display: block;
  }

  .card-counter .count-name{
    position: absolute;
    right: 35px;
    top: 65px;
    font-style: italic;
    text-transform: capitalize;
    opacity: 0.5;
    display: block;
    font-size: 18px;
  }
</style>
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