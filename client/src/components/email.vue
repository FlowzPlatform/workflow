<template>
  <div class="email">
      <div class="container">
          <p style="text-align: center;margin-bottom: 10px; font-size: 40px; text-decoration: underline"><b> Customer Proof</b></p>
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
          <editor :plugins="plugins" api-key="ppzi01crrfo3pvd43s3do89pguwkhowrwajpjdqdkginzj7k" v-model="GetHtmlOfEditor" :initial-value="tinyMCEcontent"></editor>
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
      let config11 = config
    for(let idx in this.btnArr) {
        let targetId = (new Buffer(this.btnArr[idx])).toString('base64')
        this.btn = this.btn + `
        <a href="${config11.serverURI}/email-receive/${this.iid}/${targetId}">
        <button type=\"submit\" style=\"width: 140px; height: 45px; font-family: 'Roboto', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 500; color: #000; background-color: #eee; border: none; border-radius: 45px; box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.2); transition: all 0.3s ease 0s; cursor: pointer\">
        <span class=\"glyphicon glyphicon-ok\" style=\"color:black; margin-right:8px\"></span> ${idx.toUpperCase()}</button><br><br>
        </a>
        `
      }
      this.tinyMCEcontent = this.sendDataEmail + this.btn
    },
    data () {
      return {
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
        btn:'',
        plugins: 'print preview fullpage powerpaste searchreplace autolink directionality advcode visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount tinymcespellchecker a11ychecker imagetools mediaembed linkchecker contextmenu colorpicker textpattern help',
        GetHtmlOfEditor: '',
        sendDataEmail2: '<html><div><p style="color:red">hello</p></div></html>',
        loading: false,
        tinyMCEcontent: ''
      }
    },
    methods: {
      sendEmail() {
        let htmlContent;
        if(this.GetHtmlOfEditor === ''){
          htmlContent = this.sendDataEmail
        } else {
          htmlContent = this.GetHtmlOfEditor
        }
        this.emailForm.html = `<!DOCTYPE html><html lang=\"en\" ><head> <meta charset=\"UTF-8\"><title>Email Proof</title>
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css'> </head>
          <body><div class=\"container\">
          ` + htmlContent +`
          <h2>Customer Proof:</h2>
          ${this.btn}
          <br> <h4>Comment: ${this.emailForm.Comment}</h4><br>
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
