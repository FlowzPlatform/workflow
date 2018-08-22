<template>
  <div class="email">
    <div class="container">
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
import sendmailModal from '@/api/sendmail'
import config from '@/config'
  /*eslint-disable*/
  export default {
    name: 'email',
    computed: {
    },
    props: {
    'btnArr': Object,
    'iid': String
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
        }
      }
    },
    methods: {
      sendEmail() {
        let config11 = config
        let btn = ''
        console.log(this.btnArr)
        for(let idx in this.btnArr) {
          let targetId = (new Buffer(this.btnArr[idx])).toString('base64')
          btn = btn + `
          <a href="${config11.serverURI}/email-receive/${this.iid}/${targetId}">
          <button type=\"submit\" class=\"btn btn-success\">
          <span class=\"glyphicon glyphicon-ok\" style=\"color:black; margin-right:8px\"></span> ${idx.toUpperCase()}: move to production</button><br><br>
          </a>
          `
        }
        this.emailForm.html = `<!DOCTYPE html><html lang=\"en\" ><head> <meta charset=\"UTF-8\"><title>Email Proof</title>
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css'> </head>
          <body><div class=\"container\">
          <h2>Customer Proof:</h2>
          ${btn}
          <h4>While we strongly you to take advantage of this time saving option,
              your proof may still be fixed back to company name at: <strong>Toll Free Fax:</strong> 800-238-0082
              <strong>Local Fax:<strong> 716-773-2332</h4></div></body></html>`

        sendmailModal.post(this.emailForm)
        .then((res)=>{
          console.log(res)
          this.$emit('on-done', true)
        })
        .catch((err)=>{
          console.log(err)
        })
      }
    }
  }
</script>
