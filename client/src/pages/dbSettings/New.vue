<template>
    <div>
        <h3>Add New Connection</h3>
        <Form ref="frmSettings" :model="frmSettings" :rules="frmRule" class="form">
            <Row :gutter="20">
                <Col :span="12">
                    <FormItem label="Connection Name" prop="connection_name">
                        <Input placeholder="Connection Name" v-model.trim="frmSettings.connection_name"></Input>
                    </FormItem>
                </Col>
                <Col :span="12">
                    <FormItem label="Database Name" prop="dbname">
                        <Input placeholder="Flowz" v-model.trim="frmSettings.dbname"></Input>
                    </FormItem>
                </Col>
            </Row>
            <Row :gutter="20">
                <Col :span="12">
                    <FormItem label="Host" prop="host">
                        <Input placeholder="localhost" v-model.trim="frmSettings.host"></Input>
                    </FormItem>
                </Col>
                <Col :span="12">
                    <FormItem label="Port" prop="port">
                        <Input placeholder="8080" v-model.trim="frmSettings.port"></Input>
                    </FormItem>
                </Col>
            </Row>
            <Row :gutter="20">
                <Col :span="12">
                    <FormItem label="username">
                        <Input placeholder="Username" v-model.trim="frmSettings.username"></Input>
                    </FormItem>
                </Col>
                <Col :span="12">
                    <FormItem label="Password">
                        <Input type="password" placeholder="Password" v-model.trim="frmSettings.password"></Input>
                    </FormItem>
                </Col>
            </Row>
            <Row :gutter="20">
                <Col :span="12">
                    <FormItem label="Select Database">
                        <Select v-model="frmSettings.selectedDb" @on-change="clearIcon">
                            <Option value="mongo" key="mdb">Mongo DB</Option>
                            <Option value="rethink" key="rdb">Rethink DB</Option>
                            <Option value="elastic" key="edb">ElasticSearch DB</Option>
                            <Option value="nedb" key="ndb">Ne DB</Option>
                        </Select>
                    </FormItem>
                </Col>
                <Col :span="12">
                    <FormItem label="Notes">
                        <Input type="textarea" v-model.trim="frmSettings.notes"></Input>
                    </FormItem>
                    
                </Col>
            </Row>
            <Row :gutter="20">
                <Col :span="12">
                    <FormItem label="Icon" v-if="frmSettings.selectedDb">
                        <div class="demo-upload-list">
                            <template>
                                <img v-if="frmSettings.upldIcn" :src="frmSettings.upldIcn">
                                <div v-else>
                                    <img v-if="frmSettings.selectedDb === 'mongo'" :src="mongo">
                                    <img v-if="frmSettings.selectedDb === 'rethink'" :src="rethink">
                                    <img v-if="frmSettings.selectedDb === 'elastic'" :src="elastic">
                                    <img v-if="frmSettings.selectedDb === 'nedb'" :src="nedb">
                                </div>
                            </template>
                         </div>
                         <Col v-if="loading" class="demo-spin-col" span="1">
                            <Spin fix>
                                <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                            </Spin>
                        </Col>
                        <div class="upload-btn-wrapper">
                            <button class="btn"><Icon type="ios-cloud-upload-outline"></Icon> Upload Icon</button>
                            <input type="file" id="upldIcn" title="Upload icon" accept="image/*">
                        </div>
                    </FormItem>
                </Col>
                <Col :span="12">
                    <FormItem>
                        <Checkbox v-model="frmSettings.isenable" label="enable">Enable</Checkbox>
                        <span v-if="checkdefault">
                            <Checkbox v-model="frmSettings.isdefault" label="default" disabled>is Default</Checkbox>
                        </span>
                        <span v-else>
                            <Checkbox v-model="frmSettings.isdefault" label="default">is Default</Checkbox>
                        </span>
                    </FormItem>
                </Col>
            </Row>
            <Row>
                <FormItem>
                    <Button type="primary" @click="handleSubmit('frmSettings')">Create Connection</Button>
                </FormItem>
            </Row>
        </Form>
    </div>
</template>
<script>
/*eslint-disable*/
const $ = require('jquery')
import api from '@/api'
import InputTag from 'vue-input-tag'
import mongo from '../../assets/images/mongo.png'
import rethink from '../../assets/images/rethink.png'
import elastic from '../../assets/images/elasticsearch.png'
import nedb from '../../assets/images/nedb.png'
import databasesModel from '@/api/databases'

export default{
    components: {'input-tag': InputTag},
    data() {
        return {
            checkdefault: false,
            mongo,
            rethink,
            elastic,
            nedb,
            loading: false,
            frmSettings: {
                isenable: true,
                connection_name: '',
                host: '',
                port: '',
                dbname: '',
                username: '',
                password: '',
                selectedDb: '',
                upldIcn: '',
                notes: '',
                isdefault: false
            },
            frmRule: {
                connection_name: [
                    { required: true, message: 'Please enter connection name', trigger: 'blur' }
                ],
                host: [
                    { required: true, message: 'Please enter host name', trigger: 'blur' },
                ],
                port: [
                    { required: true, message: 'Please enter port number', trigger: 'blur' },
                ],
                dbname: [
                    { required: true, message: 'Please enter database name', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        checkdefaultfun: async function() {
          // console.log('................')
          var _res = await api.request('get', '/settings')
          var dbins_l = 0
          for(let db in _res.data) {
            dbins_l += _res.data[db].dbinstance.length
          }
          // console.log(dbins_l)
          if(dbins_l === 0) {
            // return false
            this.checkdefault = true
            this.frmSettings.isdefault = true
          }
        },
        clearIcon(value) {
            this.frmSettings.upldIcn = ''
        },
        handleSubmit(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    // let guid = (this.S4() + this.S4() + "-" + this.S4() + "-4" + this.S4().substr(0,3) + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4()).toLowerCase();
                    // let obj = this.frmSettings;
                    // obj.id = guid;
                    // api.request('post', '/settings', this.frmSettings)
                    // this.frmSettings.id = '1aad0216-67f5-4803-3864-22dd01fa2ad7'
                    databasesModel.post(this.frmSettings)
                        .then(response => {
                            // this.$Message.success('Success');
                            // if(response.data == 'Exist'){
                            //     this.$Notice.error({duration: 5, title:'Alredy Exist!!', desc:'Connection Alredy exist...'})
                            // }
                            // else {
                            this.$Notice.success({duration: 3, title:'Success!!', desc:'Connection Created...'})
                            this.$router.push({name: 'list'});
                            // }
                        })
                        .catch(error => {
                            if (error.response.data.errors.hasOwnProperty('message')) {
                                this.$Notice.error({duration: 3, title:'Error!!', desc: error.response.data.errors.message})
                            } else {
                                this.$Notice.error({duration: 3, title:'Error!!'})
                            }
                            console.log(error)
                            this.loading = false
                        })
                } else {
                    // this.$Message.error('Error!');
                    this.$Notice.error({duration: 2, title:'Error!!', desc:'Please enter inputs!'})
                }
            })
        }
        // S4() {
        //     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        // }
    },
    mounted() {
        this.checkdefaultfun()
        this.frmSettings.selectedDb = this.$route.params.db;
        var self = this;
        $(document).ready(function(){
            $('#upldIcn').change(function() {
                let bucket = new AWS.S3({ params: { Bucket: 'airflowbucket1/obexpense/expenses' } });
                let fileChooser = document.getElementById('upldIcn');
                let file = fileChooser.files[0];

                if (file) {
                    self.loading = true;
                    var params = { Key: file.name, ContentType: file.type, Body: file };
                    bucket.upload(params).on('httpUploadProgress', function (evt) {
                    }).send(function (err, data) {
                        if(err) {
                            alert(err);
                        } else {
                            self.frmSettings.upldIcn = data.Location;
                        }
                        self.loading = false;
                    })
                }
            });
        });
    }
}
</script>

<style scoped>
.no-margin{
        margin:0px;
    }
.form {
        margin-top: 50px;
    }
.demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
.demo-spin-col{
        height: 10px;
        position: relative;
    }
.demo-upload-list{
        display: inline-block;
        width: 60px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0,0,0,.2);
        margin-right: 4px;
    }
    .demo-upload-list img{
        width: 100%;
        height: 100%;
    }
    .demo-upload-list-cover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
    }
    .demo-upload-list:hover .demo-upload-list-cover{
        display: block;
    }
    .demo-upload-list-cover i{
        color: #fff;
        font-size: 10px;
    }
    .upload-btn-wrapper {
        position: relative;
        overflow: hidden;
        display: inline-block;
    }

    .btn {
        border: 0.5px solid #eff0f1;
        color: #838893;
        background-color: transparent;
        padding: 1px 20px;
        border-radius: 4px;
        font-size: 12px;
        outline: none;
    }

    .upload-btn-wrapper:hover .btn{
        border: 0.5px solid #2d8cf0;
        color: #2d8cf0;
        transition: color 0.5s, border 1s;
    }

    .upload-btn-wrapper input[type=file] {
        font-size: 100px;
        position: absolute;
        opacity: 0;
        cursor: pointer;
        outline: none;
    }
</style>
