<template>
  <div class="container">
    <!-- 标题 -->
    <h5 class="btn-primary">展示系统</h5>
    <div class="total">
      <div class="alert alert-primary" role="alert">报警总数{{total}}</div>
    </div>
    <!-- 表格区域 -->
    <table class="table table-bordered table-striped table-hover">
      <!-- 表头 -->
      <thead>
        <tr>
          <th scope="col">设备名称</th>
          <th scope="col">报警</th>
          <th scope="col">故障</th>
          <th scope="col">总数</th>
        </tr>
      </thead>
      <!-- 表身 -->
      <tbody>
        <tr v-for="item in arr" :key="item.id" :id="item.id" @click="fn($event)">
          <td scope="row">
            <a href="javascript:;">{{item.name}}</a>
          </td>
          <td>{{item.warningCount}}</td>
          <td>{{item.errorCount}}</td>
          <td>{{item.total}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  // 数据部分
  data() {
    return {
      user: {
        username: "admin",
        password: "admin123"
      },
      total: "",
      arr: [],
      websock: null
    };
  },
  created() {
    // 设置token  用户识别是否可以调用接口
    $.ajax({
      url: "http://192.168.31.126:8887/user/login",
      type: "post",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify(this.user),
      success: function(info) {
        // 将token存到本地的localStorage中保存
        localStorage.setItem("token", info.data);
      }
    });
    this.render();
    this.initWebSocket();
  },
  destroyed() {
    this.websock.close();
  },
  methods: {
    render() {
      $.ajax({
        url: "http://192.168.31.126:8887/category/getCategoryList",
        type: "get",
        dataType: "json",
        headers: {
          Authorization: localStorage.getItem("token")
        },
        success: info => {
          // console.log(info);
          this.total = info.data[0].totalErrorCount;
          this.arr = info.data[0].listPageData;
        }
      });
    },
    initWebSocket() {
      //初始化weosocket
      let token = localStorage.getItem("token");
      const wsuri = "ws://192.168.31.126:8887/websocket/indexPage/0/" + token;
      this.websock = new WebSocket(wsuri);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },
    websocketonopen() {
      console.log("连接成功~");
    },
    websocketonerror() {
      //连接建立失败重连
      console.log("连接错误~");
    },
    websocketonmessage(e) {
      //数据接收
      let redata = JSON.parse(e.data);
      this.total = redata.data[0].totalErrorCount;
      this.arr = redata.data[0].listPageData;
    },
    websocketclose() {
      //关闭
      console.log("断开连接");
    },
    fn(e) {
      let id = $(e.currentTarget).attr("id");
      this.$router.push("/cate?id=" + id);
    }
  }
};
</script>
<style scoped>
h5.btn-primary {
  padding: 10px;
  margin-bottom: 10px;
  margin-top: 10px;
}

a,
a:hover {
  text-decoration: none;
  color: #21252f;
}
.total {
  float: right;
  width: 200px;
  text-align: center;
}
</style>
