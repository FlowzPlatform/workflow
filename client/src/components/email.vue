<template>
  <div class="email">
    <div class="container">
          <p style="text-align: center;margin-bottom: 10px; font-size: 40px; text-decoration: underline"><b> Customer Proof</b></p>
          <schemasubform v-if="!flag" :schemainstance="formSchemaInstance"></schemasubform>
          <div class="row" v-if="flag">
            <div class="col-md-6">
              <div class="form-group">
                <label for="from">From</label>
                <input type="text" v-model="emailForm.from" class="form-control" id="from"  placeholder="Enter From email">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="to">To</label>
                <input type="text" v-model="emailForm.to" class="form-control" id="to"  placeholder="Enter TO">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="cc">CC:</label>
                <input type="text" v-model="emailForm.cc" class="form-control" id="cc"  placeholder="Enter CC">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="bcc">BCC:</label>
                <input type="text" v-model="emailForm.bcc" class="form-control" id="bcc"  placeholder="Enter BCC">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="type">Subject:</label>
                <input type="text" v-model="emailForm.subject" class="form-control" id="type"  placeholder="Enter Type">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="td">Title description:</label>
                <input type="text" v-model="emailForm.titleDescription" class="form-control" id="td"  placeholder="Enter Title Description">
              </div>
            </div>
          </div>
          <!-- <div v-if="!flag"> -->
            
          <!-- </div> -->
          <editor :plugins="plugins" api-key="ppzi01crrfo3pvd43s3do89pguwkhowrwajpjdqdkginzj7k" v-model="GetHtmlOfEditor" :initial-value="tinyMCEcontent"></editor>
          <div v-if="flag" class="form-group">
            <label for="exampleTextarea">Comment</label>
            <textarea class="form-control" v-model="emailForm.Comment" id="exampleTextarea" rows="3"></textarea>
          </div>
          <!-- <div class="form-group">
            <label for="exampleInputFile">File input</label>
            <input type="file" class="form-control-file" id="exampleInputFile" aria-describedby="fileHelp">
          </div> -->
          <Button @click="sendEmail" type="primary" :loading="loading">Submit</Button>
      </div>
  </div>
</template>
<script>
import sendmailModal from '@/api/sendmail'
import config from '@/config'
import schemaModel from '@/api/schema'
  /*eslint-disable*/
  export default {
    name: 'email',
    computed: {
      // componentLoader () { 
      //   return () => import('./${this.formSchemaInstance}')
      // }
    },
    components: {
      'editor': (resolve) => { require(['@tinymce/tinymce-vue'], resolve) },
      'schemasubform': (resolve) => { require(['./SchemaSubForm'], resolve) }
    },
    props: {
    'btnArr': Object,
    'iid': String,
    'tableId': String,
    'taskName': String,
    'sendDataEmail': String,
    'emailSchemaId': String,
    'flag': Boolean
    },
    async mounted () {
      let config11 = config
      for(let idx in this.btnArr) {
          let targetId = (new Buffer(this.btnArr[idx])).toString('base64')
          this.btn = this.btn + `
          <a href="${config11.serverURI}/email-receive/${this.iid}/${targetId}/${this.tableId}/${this.taskName}">
          <button type=\"submit\" style=\"width: 140px; height: 45px; font-family: 'Roboto', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 500; color: #000; background-color: #eee; border: none; border-radius: 45px; box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.2); transition: all 0.3s ease 0s; cursor: pointer\">
          <span class=\"glyphicon glyphicon-ok\" style=\"color:black; margin-right:8px\"></span> ${idx.toUpperCase()}</button><br><br>
          </a>
          `
      }
      this.tinyMCEcontent = this.sendDataEmail.replace(/{{NextTargetButton}}/g, this.btn) + this.btn
      if (this.flag == false) {
        let response = await schemaModel.get(this.emailSchemaId).catch(error => {
          console.log(error)
        })
        this.formSchemaInstance.data = []
        this.schema = response.data
        this.entity = response.data.entity
        this.formSchemaInstance.entity = this.schema.entity
        for (let [index, entity] of this.formSchemaInstance.entity.entries()) {
          if (entity.customtype) {
            this.formSchemaInstance.entity[index]['entity'] = await this.getChildEntity(entity.type)
          }
        }

        await this.handleAdd()
      }
    },
    data () {
      return {
        loading: false,
        emailForm: {
          cc: '',
          bcc: '',
          from: 'testnewpo@officebrain.com',
          to: 'abc@officebrain.com',
          subject: '',
          Comment: '',
          body: 'Hello',
          html : ''
        },
        formSchemaInstance: {
          data: [],
          entity: []
        },
        btn:'',
        plugins: 'print preview searchreplace fullscreen image link media template codesample table hr pagebreak anchor toc insertdatetime lists textcolor imagetools linkchecker contextmenu colorpicker',
        GetHtmlOfEditor: '',
        tinyMCEcontent: ''
      }
    },
    methods: {
      async handleAdd () {
        var self = this
        var obj = {}
        
          // obj.database = this.schema.database
        obj.Schemaid = this.emailSchemaId
        // _.forEach(self.entity, async function (v) {
        for (let v of self.formSchemaInstance.entity) {
          if (v.customtype) {
            obj[v.name] = await self.getChildData(v.type)
          } else {
            if (v.type === 'number') {
              if (v.property.defaultValue !== '') {
                obj[v.name] = v.property.defaultValue
              } else {
                if (v.property.min !== 0 && v.property.min !== '') {
                  obj[v.name] = v.property.min
                } else {
                  obj[v.name] = 1
                }
              }
            } else if (v.type === 'currentuser') {
              obj[v.name] = this.$store.state.user.fullname || this.$store.state.user.email
            } else if (v.type === 'currenttime') {
              obj[v.name] = new Date()
            }  else if (v.type === 'boolean') {
              if (v.property.defaultValue !== '' || v.property.defaultValue === 'true') {
                obj[v.name] = true
              } else {
                obj[v.name] = false
              }
            } else if (v.type === 'file') {
              obj[v.name] = []
            } else {
              if (v.property.defaultValue !== '') {
                obj[v.name] = v.property.defaultValue
              } else {
                obj[v.name] = ''
              }
            }
          }
        }
        this.formSchemaInstance.data.push(obj)

        // }
      },

      async getChildData (id) {
        // alert(id)
        var arrObj = []
        var self = this
        await schemaModel.get(id)
        .then(async (response) => {
          var _res = response.data
          var obj = {}

          // console.log("res.entity: ", _res.entity)
          // obj.id = self.getGuid();
          // obj.database = _res.database
          // obj.Schemaid = _res._id
          for (let v of _res.entity) {
            if (v.customtype) {
              obj[v.name] = await self.getChildData(v.type)
            } else {
              if (v.type === 'number') {
                if (v.property.defaultValue !== '') {
                  obj[v.name] = v.property.defaultValue
                } else {
                  if (v.property.min !== 0 && v.property.min !== '') {
                    obj[v.name] = v.property.min
                  } else {
                    obj[v.name] = 1
                  }
                }
              } else if (v.type === 'currentuser') {
                obj[v.name] = this.$store.state.user.fullname || this.$store.state.user.email
              } else if (v.type === 'currenttime') {
                obj[v.name] = new Date()
              }  else if (v.type === 'boolean') {
                if (v.property.defaultValue !== '' || v.property.defaultValue === 'true') {
                  obj[v.name] = true
                } else {
                  obj[v.name] = false
                }
              } else if (v.type === 'file') {
                obj[v.name] = []
              } else {
                if (v.property.defaultValue !== '') {
                  obj[v.name] = v.property.defaultValue
                } else {
                  obj[v.name] = ''
                }
              }
            }
          }
          arrObj.push(obj)
        })
        .catch(error => {
          console.log('Error', error)
        })
        return arrObj
      },
      async getChildEntity (id) {
        // alert('entity')
        var self = this
        var res = []
        // var _res = await axios.get('https://api.flowzcluster.tk/eng/schema/' + id).catch(function (error) { console.log(error) })
        let _res = await schemaModel.get(id).catch(err => {
          console.log('err', err)
        })
        for (let [index, entity] of _res.data.entity.entries()) {
          if (entity.customtype) {
            _res.data.entity[index]['entity'] = await self.getChildEntity(entity.type)
          }
        }
        res.push(_res.data)
        return res
      },
      sendEmail() {
        this.loading = true
        let htmlContent;
        if(this.GetHtmlOfEditor === ''){
          htmlContent = this.sendDataEmail
          htmlContent = this.sendDataEmail.replace(/{{NextTargetButton}}/g, this.btn)
        } else {
          htmlContent = this.GetHtmlOfEditor
        }
        if (this.flag == true) {
          this.emailForm.html = `<!DOCTYPE html><html lang=\"en\" ><head> <meta charset=\"UTF-8\"><title>Email Proof</title>
          <body><div class=\"container\">
          ` + htmlContent +`
          <br> <h4>Comment: ${this.emailForm.Comment}</h4><br></body></html>`
          sendmailModal.post(this.emailForm)
          .then((res)=>{
            this.loading = false
            this.$emit('on-done', true)
            this.$Message.success('Proof mail send successfully')
          })
          .catch((err)=>{
            this.loading = false
            console.log(err)
            this.$Message.error('Proof mail send error')
          })
        } else {
          this.formSchemaInstance.data[0].html = []
          this.formSchemaInstance.data[0].html = `<!DOCTYPE html><html lang=\"en\" ><head> <meta charset=\"UTF-8\"><title>Email Proof</title>
          <body><div class=\"container\">
          ` + htmlContent +`
          <br> <h4>Comment: ${this.formSchemaInstance.data.comment}</h4><br></div></body></html>`
              console.log('this.formSchemaInstance.data', this.formSchemaInstance.data)
          sendmailModal.post(this.formSchemaInstance.data[0])
          .then((res)=>{
            this.loading = false
            this.$emit('on-done', true)
            this.$Message.success('Proof mail send successfully')
          })
          .catch((err)=>{
            this.loading = false
            console.log(err)
            this.$Message.error('Proof mail send error')
          })
        }
      }
    }
  }
</script>
<style>
.mce-edit-area.mce-container.mce-panel.mce-stack-layout-item > iframe {
  height: 500px !important;
}
</style>
