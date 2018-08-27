<template>
  <div class="email">
      <div class="container">
      <editor :plugins="plugins" api-key="ppzi01crrfo3pvd43s3do89pguwkhowrwajpjdqdkginzj7k" v-model="GetHtmlOfEditor" :initial-value="sendDataEmail"></editor>
          <h2>Proof:</h2>
          <div class="row">
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
                <label for="type">Type:</label>
                <input type="text" v-model="emailForm.type" class="form-control" id="type"  placeholder="Enter Type">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="td">Title description:</label>
                <input type="text" v-model="emailForm.titleDescription" class="form-control" id="td"  placeholder="Enter Title Description">
              </div>
            </div>
          </div>
          <div class="form-group">
            <label for="exampleTextarea">Comment</label>
            <textarea class="form-control" v-model="emailForm.Comment" id="exampleTextarea" rows="3"></textarea>
          </div>
          <!-- <div class="form-group">
            <label for="exampleInputFile">File input</label>
            <input type="file" class="form-control-file" id="exampleInputFile" aria-describedby="fileHelp">
          </div> -->
          <button @click="sendEmail" type="submit" class="btn btn-primary">Submit</button>
      </div>
    
  </div>
</template>
<script>
import Editor from '@tinymce/tinymce-vue'
import sendmailModal from '@/api/sendmail'
import config from '@/config'
  /*eslint-disable*/
  export default {
    name: 'email',
    computed: {
    },
    components: {
      'editor': Editor
    },
    props: {
    'btnArr': Object,
    'iid': String,
    'sendDataEmail': String
    },
    mounted () {
    },
    data () {
      return {
        emailForm: {
          cc: '',
          bcc: '',
          from: 'testnewpo@officebrain.com',
          to: 'abc@officebrain.com',
          type: '',
          subject: '',
          Comment: '',
          body: 'Hello',
          html : ''
        },
        plugins: 'print preview fullpage powerpaste searchreplace autolink directionality advcode visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount tinymcespellchecker a11ychecker imagetools mediaembed  linkchecker contextmenu colorpicker textpattern help',
        GetHtmlOfEditor: '',
        sendDataEmail2: '<html><div><p style="color:red">hello</p></div></html>',
        loading: false
      }
    },
    methods: {
      sendEmail() {
        this.emailForm.subject = this.emailForm.type
        let config11 = config
        let btn = ''
        let htmlContent;
        if(this.GetHtmlOfEditor === ''){
          htmlContent = this.sendDataEmail
        } else {
          htmlContent =  '<link rel="stylesheet" href="https://unpkg.com/iview@3.0.1/dist/styles/iview.css"> <style> .ui-card{background-color: #fff; box-shadow: 0px 0px 25px #dadada; border-radius: 10px; padding: 10px 20px;}.card-title{text-transform: capitalize; color: #FFF; font-size: 18px; background-color: #292929; padding: 10px 30px; border-top-right-radius: 5px; border-bottom-right-radius: 5px; margin-left: -20px; margin-bottom: 10px;}.btnAdd{background-color: #53CAE8; border-radius: 50px; font-size: 14px; text-transform: uppercase; color: #fff; border: none; font-style: italic;}.btnAdd:hover{background-color: #83d5ea; color: #fff;}.btnDelete{font-size: 14px; border-radius: 50px; color: #fff !important; position: absolute; bottom: 10px; right: 10px; background-color: #FF0000; width: 20px; height: 20px;}.btnDelete i{position: absolute; top: 4px; left: 5px;}.field-label{text-transform: capitalize;}.formTitle{text-transform: capitalize;}.jumper-links{list-style: none; font-size: 14px;}.jumper-links a{text-decoration: none; /*color: #53cae8;*/ text-align: left; font-weight: bold; text-transform: capitalize;}.fixed-div{position: fixed; right: 0;}.ivu-form-item-content{/*line-height: 15px !important;*/} </style>' + this.GetHtmlOfEditor
        }
        for(let idx in this.btnArr) {
          let targetId = (new Buffer(this.btnArr[idx])).toString('base64')
          btn = btn + `
          <a href="${config11.serverURI}/email-receive/${this.iid}/${targetId}">
          <button type=\"submit\" class=\"btn btn-success\">
          <span class=\"glyphicon glyphicon-ok\" style=\"color:black; margin-right:8px\"></span> ${idx.toUpperCase()} : Move To ${idx.toUpperCase()}</button><br><br>
          </a>
          `
        }
        this.emailForm.html = `<!DOCTYPE html><html lang=\"en\" ><head> <meta charset=\"UTF-8\"><title>Email Proof</title>
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css'> </head>
          <body><div class=\"container\">
          ` + htmlContent +`
          <h2>Customer Proof:</h2>
          ${btn}
          <h4>While we strongly you to take advantage of this time saving option,
              your proof may still be fixed back to company name at: <strong>Toll Free Fax:</strong> 800-238-0082
              <strong>Local Fax:<strong> 716-773-2332</h4></div></body></html>`
        sendmailModal.post(this.emailForm)
        .then((res)=>{
          this.$emit('on-done', true)
        })
        .catch((err)=>{
          console.log(err)
        })
      }
    }
  }
</script>
