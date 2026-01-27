<template>
  <div
    id="app"
    class="min-w-[700px] p-[15px] my-4 text-center text-[#2c3e50] antialiased"
  >
    <div>
      <h1 class="text-3xl font-bold my-4">Puniket Circle Viewer</h1>

      <div class="max-w-[800px] my-5 mx-auto">
        <p class="mt-4 mb-12">
          ぷにケットのサークル配置リストをいい感じに表示するアプリです
        </p>
        <div>
          <div class="p-4 my-4 bg-[#f8f8f8] rounded-[10px]">
            <label class="float-left">
              サークル配置リストの Web ページを保存した HTML
              ファイルを選択してください
            </label>
            <input
              class="text-sm w-full my-2"
              id="file"
              type="file"
              name="file"
              accept="text/html,.htm,.html"
              @change="onFileChange"
            />
          </div>

          <p class="my-4">または</p>

          <div class="p-4 my-4 bg-[#f8f8f8] rounded-[10px]">
            <label class="float-left">
              サークル配置リストの URL を入力してください
              <span class="text-[0.8em] font-semibold text-[#009688]">
                （ブラウザの CORS 制限の無効化が必要です）
              </span>
            </label>
            <input
              class="text-sm w-full px-5 py-3 my-2 box-border rounded-[3px] border border-[rgb(118,118,118)]"
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

      <div class="mt-16 mb-8">
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
}
</style>
