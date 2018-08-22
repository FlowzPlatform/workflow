<template>
  <div class="email">
    <div class="container">
      <form action="http://172.16.230.140:3030/email-receive" method="POST">
        <h2>Proof:</h2>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="from">From</label>
              <input type="text" class="form-control" id="from"  placeholder="Enter From email">
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="to">To</label>
              <input type="text" class="form-control" id="to"  placeholder="Enter TO">
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="cc">CC:</label>
              <input type="text" class="form-control" id="cc"  placeholder="Enter CC">
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="bcc">BCC:</label>
              <input type="text" class="form-control" id="bcc"  placeholder="Enter BCC">
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="type">Type:</label>
              <input type="text" class="form-control" id="type"  placeholder="Enter Type">
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="td">Title description:</label>
              <input type="text" class="form-control" id="td"  placeholder="Enter Title Description">
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="exampleTextarea">Comment</label>
          <textarea class="form-control" id="exampleTextarea" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label for="exampleInputFile">File input</label>
          <input type="file" class="form-control-file" id="exampleInputFile" aria-describedby="fileHelp">
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
    </div>
  </div>
</template>
<script>
  /*eslint-disable*/
  export default {
    name: 'email',
    computed: {
    },
    mounted () {
    },
    data () {
      return {
      }
    },
    methods: {
    }
  }
</script>