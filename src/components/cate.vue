<template>
  <div class="container">
    <!-- 标题区域 -->
    <h5 class="btn-primary">展示系统</h5>
    <div class="total">
      <div class="alert alert-primary" role="alert">报警总数{{total}}</div>
    </div>
    <div class="mian">
      <!-- 故障以及报警详情区域 -->
      <div class="msg">
        <!-- 报警详情模板渲染 -->
        <div class="air1" v-for="item in arr1" :id="item[0].deviceId">
          <table class="table table-bordered table-striped table-hover">
            <thead>
              <tr class="btn-primary">
                <th scope="col" class="name">{{item[0].deviceName}}</th>
                <th scope="col">
                  报警
                  <i class="iconfont icon-et-wrong fa" @click="close($event)"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="spec" v-for="v in item">
                <td scope="row">{{v.name}}</td>
                <td>{{v.value}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="aside btn-primary">
        <!-- 清单列表 -->
        <!-- <p>暂时没有数据~</p> -->
        <div
          class="alert alert-primary"
          role="alert"
          v-for="item in arr"
          :key="item.id"
          :id="item.id"
          @click="fn($event)"
        >
          <a href="javascript:;" class="alert-link">{{item.name}}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      total: "",
      arr: [],
      websock: null,
      arr1: [],
      default: "",
      listId: []
    };
  },
  methods: {
    // 取出地址栏的参数
    getId() {
      return location.hash.split("?")[1].split("=")[1];
    },
    // ajax渲染列表内容
    render(id) {
      $.ajax({
        url: "http://192.168.31.126:8887/category/getCategoryById/" + id + "",
        type: "get",
        dataType: "json",
        headers: {
          Authorization: localStorage.getItem("token")
        },
        success: info => {
          this.default = info.data[0].listPageData[0].id;
          this.listId.push(info.data[0].listPageData[0].id.toString());
          this.websocketonopen(event);
          this.total = info.data[0].totalErrorCount;
          this.arr = info.data[0].listPageData;
        }
      });
    },
    initWebSocket(id) {
      //初始化weosocket
      let token = localStorage.getItem("token");
      const wsuri =
        "ws://192.168.31.126:8887/websocket/categoryPage/" + id + "/" + token;
      this.websock = new WebSocket(wsuri);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },
    websocketonopen(event) {
      console.log("连接成功~");
      var param = {};
      param.deviceId = this.listId[0];
      var jsonStr = JSON.stringify(param);
      this.websocketsend(jsonStr);
    },
    websocketonerror() {
      //连接建立失败重连
      console.log("连接错误~");
    },
    websocketonmessage(e) {
      //数据接收
      let redata = JSON.parse(e.data);
      // 没有值时为空
      console.log(redata);
      this.arr1.push(redata.data);
      // console.log(this.arr1);
      if (redata[0]) {
        // console.log(redata[0]);
        this.total = redata[0].totalErrorCount;
        redata[0].listPageData = redata[0].listPageData || [];
        this.arr1 = [];
        redata[0].listPageData.forEach(item => {
          this.arr1.push(item.statusList);
        });
      } else {
        console.log("目前没有实时数据");
      }
      // console.log(this.arr1);
    },
    websocketsend(Data) {
      //数据发送
      this.websock.send(Data);
    },
    websocketclose() {
      //关闭
      console.log("断开连接");
    },
    // 点击事件
    fn(e) {
      let id = $(e.currentTarget).attr("id");
      // console.log(id);

      if (this.listId.indexOf(id) != -1) {
        return;
      } else {
        this.clickSend(id);
        // console.log(this.listId);
      }
    },
    clickSend(id) {
      var param = {};
      param.deviceId = id;
      var jsonStr = JSON.stringify(param);
      this.websocketsend(jsonStr);
      this.listId.push(id);
    },
    clickClose(id) {
      var param = {};
      param.removeDeviceId = id;
      var jsonStr = JSON.stringify(param);
      this.websocketsend(jsonStr);
    },
    close(e) {
      let p = $(e.currentTarget)
        .parent()
        .parent()
        .parent()
        .parent()
        .parent();

      // p.fadeOut();
      this.listId = [];
      let id = p.attr("id");
      this.arr1 = this.arr1.filter((ele, index, arr) => {
        if (ele[0].deviceId != id) {
          return true;
        } else {
          return false;
        }
      });
      let idx = this.listId.findIndex((value, index, arr) => {
        return value == p.attr("id");
      });
      this.listId.splice(1, idx);
      this.clickClose(id);
    }
  },
  created() {
    let id = this.getId();
    this.render(id);
    this.initWebSocket(id);
  },
  destroyed() {
    this.websock.close(); //离开路由之后断开websocket连接
  }
};
</script>

<style>
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
html,
body {
  height: 100%;
}
.mian {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.mian .msg {
  width: 100%;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 0;
  padding-left: 200px;
}
.mian .aside {
  width: 200px;
  padding: 10px;
  height: 1500px;
  position: relative;
  left: 0;
  top: 0;
}
.msg .air1 {
  float: left;
  margin: 10px 40px;
  width: 300px;
  height: 200px;
}
.aside .alert.alert-primary:hover {
  background-color: red;
}
thead th {
  position: relative;
}
thead th i.fa {
  position: absolute;
  right: -10px;
  top: -17px;
  font-size: 25px;
  opacity: 0;
  color: #999;
}
thead th:hover i {
  opacity: 1;
}
.active {
  background-color: red;
}
.total {
  float: left;
}
.hide {
  display: none;
}
</style>
