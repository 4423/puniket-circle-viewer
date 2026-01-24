<template>
  <div id="app" class="my-4">
    <div class="home">
      <h1 class="text-3xl font-bold my-4">Puniket Circle Viewer</h1>

      <div class="header">
        <p class="usage">
          ぷにケットのサークル配置リストをいい感じに表示するアプリです
        </p>
        <div class="form">
          <div class="form-option">
            <label for="file">
              サークル配置リストの Web ページを保存した HTML
              ファイルを選択してください
            </label>
            <input
              class="text-sm"
              id="file"
              type="file"
              name="file"
              accept="text/html,.htm,.html"
              @change="onFileChange"
            />
          </div>

          <p id="or">または</p>

          <div class="form-option">
            <label for="url">
              サークル配置リストの URL を入力してください
              <span id="msg-cors">
                （ブラウザの CORS 制限の無効化が必要です）
              </span>
            </label>
            <input
              class="text-sm"
              id="url"
              v-model="inputURL"
              type="url"
              name="url"
              pattern="https?://www.puniket.com/.*"
              placeholder="例）http://www.puniket.com/xxxx_list.htm"
            />
          </div>
        </div>
      </div>

      <div class="content">
        <CircleList v-if="data" :title="data.title" :circles="data.circles" />
        <Message v-else :msg="msg" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CircleList from "~/components/CircleList.vue";
import Message from "~/components/Message.vue";
import type { Circle } from "~/types/circle";

interface CircleData {
  title: string;
  circles: Circle[];
}

const inputURL = ref(""); //"http://www.puniket.com/diva/utahime22_1_list02.htm",
const data = ref<CircleData | null>(null);
const msg = ref("");

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  if (!file) {
    msg.value = "ファイルが選択されていません";
    data.value = null;
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result as string;
    processHTML(text);
  };
  reader.onerror = () => {
    msg.value = "ファイルの読み込みに失敗しました";
    data.value = null;
  };
  reader.readAsText(file, "windows-31j");
};

const processHTML = (html: string) => {
  try {
    const circleList = parseHTML(html);
    data.value = circleList;
    msg.value = "";
  } catch (error) {
    msg.value = "HTML の解析に失敗しました";
    data.value = null;
  }
};

const parseHTML = (html: string): CircleData => {
  var el = document.createElement("html");
  el.innerHTML = html;
  const tbody = el.getElementsByTagName("tbody")[0];
  const trs = tbody!.getElementsByTagName("tr");
  const texts = Array.from(trs).map((tr) =>
    Array.from(tr.getElementsByTagName("td")).map((td) => td.innerText),
  );
  const data = texts
    .filter((e) => e.length == 7)
    .filter((e) => e[2]!.trim()) // 配置番号 is not empty
    .slice(1) // top is header
    .map((e) => e.map((s) => s.trim())) // remove whitespace
    .map((e, i) => {
      return {
        id: i,
        circle: e[0]!,
        name: e[1]!,
        place: e[2]!,
        links: {
          hp: e[3],
          twitter: e[4],
          pixiv: e[5],
        },
        event: e[6]!,
      };
    });

  return { title: texts[0]![0]!, circles: data };
};

// inputURL watcher
watch(inputURL, async (newURL) => {
  if (!newURL) {
    data.value = null;
    msg.value = "";
    return;
  }
  if (!validURL(newURL)) {
    data.value = null;
    msg.value = "有効な URL ではありません";
    return;
  }
  const url = newURL;

  try {
    const response = await fetch(url, {
      // Shift-JIS -> UTF-8
      headers: {
        "Content-Type": "text/html; charset=shift_jis",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder("windows-31j");
    const text = decoder.decode(arrayBuffer);
    processHTML(text);
  } catch (error) {
    msg.value = "リソースの取得に失敗しました";
    data.value = null;
  }
});

const validURL: (str: string) => boolean = (str) => {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "(www\\.puniket\\.com)" + // domain name
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i",
  ); // fragment locator
  return !!pattern.test(str);
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 15px;
  min-width: 700px;
}

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
  background-color: #f8f8f8;
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
  font-size: 0.8em;
  font-weight: 600;
  color: #009688;
}

.form-option input[type="file"] {
  width: 100%;
  margin: 8px 0;
}

.form-option input[type="url"] {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
  border-radius: 3px;
  border-width: 1px;
  border-color: light-dark(rgb(118, 118, 118), rgb(133, 133, 133));
}

.content {
  margin-top: 4em;
  margin-bottom: 2em;
}
</style>
