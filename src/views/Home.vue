<template>
  <div class="home">
    <h1>Puniket Circle Viewer</h1>

    <div class="header">
      <p class="usage">
        ぷにケットのサークル配置リストをいい感じに表示するアプリです
      </p>
      <div class="form">
        <div class="form-option">
          <label for="file">
            サークル配置リストの Web ページを保存した HTML ファイルを選択してください
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept="text/html,.htm,.html"
            @change="onFileChange">
        </div>
        <p id="or">
          または
        </p>
        <div class="form-option">
          <label for="url">
            サークル配置リストの URL を入力してください
            <span id="msg-cors">（ブラウザの CORS 制限の無効化が必要です）</span>
          </label>
          <input
            type="url"
            id="url"
            name="url"
            v-model="inputURL" 
            pattern="https?://www.puniket.com/.*"
            placeholder="例）http://www.puniket.com/xxxx_list.htm">
        </div>
      </div>
    </div>

    <div class="content">
      <CircleList
        v-if="data"
        :data="data"/>
      <Message
        v-else
        :msg="msg"/>
    </div>
  </div>
</template>

<script>
import CircleList from '@/components/CircleList.vue'
import Message from '@/components/Message.vue'
import axios from 'axios'
import * as iconv from 'iconv-lite';

HTMLCollection.prototype.map = Array.prototype.map

export default {
  name: 'Home',
  components: {
    CircleList,
    Message,
  },
  data(){
    return {
      inputURL: "",//"http://www.puniket.com/diva/utahime22_1_list02.htm",
      data: null,
      msg: "",
    }
  },
  watch: {
    inputURL: function() {
      if (!this.inputURL) {
        this.data = null
        this.msg = ""
        return
      }
      if (!this.validURL(this.inputURL)) {
        this.data = null
        this.msg = "有効な URL ではありません"
        return
      }
      const url = this.inputURL
      
      axios
        .create({
          // Shift-JIS -> UTF-8
          responseType: "arraybuffer",
          transformResponse: data => iconv.decode(Buffer.from(data), "windows-31j")
        })
        .get(url)
        .then(res => this.data = this.parse(res.data))
        .catch(() => {
          // if (err.response) {
          this.msg = "リソースの取得に失敗しました"
          // } else if (err.request) {
          //   this.msg = err.request
          // } else {
          //   this.msg = err.message
          // }
          this.data = null
        })
    },
  },
  methods: {
    validURL: (str) => {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '(www\\.puniket\\.com)'+ // domain name
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return !!pattern.test(str);
    },
    parse: function (html) {
      const core = function () {
        var el = document.createElement("html");
        el.innerHTML = html;
        const tbody = el.getElementsByTagName("tbody")[0]
        const trs = tbody.getElementsByTagName("tr")
        const texts = trs.map(tr => tr.getElementsByTagName("td").map(td => td.innerText))
        
        const screenNameFromUrl = (url) => !url ? "" : "@" + url.substring(url.lastIndexOf("/") + 1)
        const data = texts
          .filter(e => e.length == 7)
          .filter(e => e[2].trim()) // 配置番号 is not empty
          .slice(1) // top is header
          .map(e => e.map(s => s.trim())) // remove whitespace
          .map((e, i) => { return { 
            id: i,
            circle: e[0], 
            name: e[1], 
            place: e[2],
            links: {
              hp: e[3],
              pixiv: e[5],
            },
            twitter: screenNameFromUrl(e[4]),
            event: e[6],
          }})

        const events = data.map(e => e.event)
        const uniqEvents = Array.from(new Set(events)).sort()

        return { title: texts[0][0], data: data, events: uniqEvents }
      }

      try {
        return core(html)
      } catch (error) {
        this.msg = "HTML の解析に失敗しました"
        return null
      }
    },
    onFileChange: async function (e) {
      const files = e.target.files || e.dataTransfer.files
      if (files.length != 1) {
        return
      }
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (ev) => {
        const html = ev.target.result
        this.data = this.parse(html)
      }
      reader.readAsText(file, "windows-31j")
    },
  },
}
</script>

<style scoped>
.header {
  max-width: 800px;
  margin: 20px auto;
}

.form label {
  float: left;
}
.form-option {
  padding: 1em;
  margin: 1em 0;
  background-color: #F8F8F8;
  border-radius: 10px;
}

.usage {
  margin-top: 1em;
  margin-bottom: 3em;
}

#or {
  margin: 1em 0;
}

#msg-cors {
  font-size: .8em;
  font-weight: 600;
  color: #009688;
}

input[type=file] {
  width: 100%;
  margin: 8px 0;
}

input[type=url] {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
}

.content {
  margin-top: 4em;
  margin-bottom: 2em;
}
</style>