import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

const PLANT_DELAY_MS = 1200;

const FONT_UI = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});

const FONT_MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

const hashString = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const formatLabel = (raw) => {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) {
    return "Kavram";
  }
  return t
    .split(" ")
    .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1))
    .join(" ");
};

/**
 * Zihinde canlandırma (visualization) — terimden bağımsız şablonlar + hash ile çeşitlilik.
 * Her çıktı: temel mantık, somut sistem benzetmesi, yazılım örneği, kısa kod kesiti.
 */
const VISUAL_PACKS = [
  {
    temel: (L) =>
      `${L}, yazılımda veriyi veya işi öngörülebilir kurallarla düzenleyen bir kavramdır. Amaç; doğru girdi için doğru çıktıyı, tekrarlanabilir biçimde üretmektir.`,
    canlandir: (L) =>
      `Bunu bir fabrika hattına düşün: Her istasyon tek bir işi yapar; ${L} ise hattın akışını, sırasını veya birbirine bağlanma şeklini tarif eden şablondur.`,
    ornek: (L) =>
      `Örneğin bir sosyal akışta gönderilerin sırayla çekilmesi, arama sonuçlarının sıralanması veya bir API’nin istekleri adım adım işlemesi bu düşünceyle aynı çizgidedir; ${L} gerçek ürünlerde sürekli tekrar eden yapıları yönetmek için kullanılır.`,
    java: `List<String> pipeline = new ArrayList<>();\npipeline.add("input");\nfor (String step : pipeline) {\n    dispatch(step);\n}`,
    cpp: `std::vector<std::string> steps;\nsteps.push_back("input");\nfor (const auto& s : steps) {\n    process(s);\n}`,
  },
  {
    temel: (L) =>
      `${L}, bilgisayar biliminde bir problemi parçalara ayırıp her parçayı net kurallarla ele almayı ifade eder. Karmaşıklığı kontrol altına almak için soyutlama katmanı görevi görür.`,
    canlandir: (L) =>
      `Kütüphanedeki rafları düşün: Her kitabın yeri sabittir; ${L}, hangi bilginin nerede duracağını ve nasıl bulunacağını tanımlayan düzen gibidir.`,
    ornek: (L) =>
      `Google gibi arama motorlarında indeksleme, e-ticaret sepetinde ürün listesi veya Excel’de satır-sütun hücrelerinin ilişkisi bu mantığın günlük yüzüdür; ${L} uygulamalarda veriye hızlı ve tutarlı erişim için devreye girer.`,
    java: `Map<String, Integer> index = new HashMap<>();\nindex.put("key", 1);\nif (index.containsKey("key")) {\n    return index.get("key");\n}`,
    cpp: `std::unordered_map<std::string,int> idx;\nidx["key"] = 1;\nif (idx.count("key")) {\n    return idx["key"];\n}`,
  },
  {
    temel: (L) =>
      `${L}, sistemdeki öğelerin birbirine nasıl bağlandığını veya sırayla nasıl ilerlediğini tanımlar. Öncelik, gecikme ve kaynak paylaşımı gibi konuların temelini oluşturur.`,
    canlandir: (L) =>
      `Şehir trafiğini hayal et: Kavşaklar ve şeritler kuralları belirler; ${L}, veri veya görev akışının hangi yoldan, hangi sırayla ilerleyeceğini modelleyen trafik düzenidir.`,
    ornek: (L) =>
      `Bildirim kuyrukları, canlı yayınlarda mesaj akışı veya CDN üzerinden statik dosya dağıtımı bu modelin ürünleşmiş halidir; ${L} yüksek eşzamanlılıkta düzenli akış sağlamak için kullanılır.`,
    java: `Queue<String> q = new ArrayDeque<>();\nq.offer("job-a");\nwhile (!q.isEmpty()) {\n    run(q.poll());\n}`,
    cpp: `std::queue<std::string> q;\nq.push("job-a");\nwhile (!q.empty()) {\n    run(q.front()); q.pop();\n}`,
  },
  {
    temel: (L) =>
      `${L}, verinin depolanması, güncellenmesi veya sorgulanması sırasında izlenen yapıyı ifade eder. Tutarlılık ve performans arasında denge kurmayı hedefler.`,
    canlandir: (L) =>
      `Büyük bir depo alanını düşün: Her paletin yeri ve etiketi bellidir; ${L}, yazılımda veri bloklarının nasıl gruplanacağını ve erişileceğini tanımlayan lojistik düzendir.`,
    ornek: (L) =>
      `Instagram’da medya önbelleği, bulutta nesne depolama veya oyun sunucularında oyuncu envanteri bu yaklaşımın örnekleridir; ${L} ölçek büyüdükçe veriyi yönetilebilir tutar.`,
    java: `record Item(String id, int qty) {}\nvar stock = List.of(new Item("x", 2));\nstock.stream()\n    .filter(i -> i.qty() > 0)\n    .toList();`,
    cpp: `struct Item { std::string id; int qty; };\nstd::vector<Item> stock{{"x",2}};\nfor (auto& i : stock) {\n    if (i.qty > 0) use(i);\n}`,
  },
  {
    temel: (L) =>
      `${L}, bir sistemin karar verme veya durum değiştirme biçimini özetler. Koşullar netleştikçe davranış öngörülebilir hale gelir.`,
    canlandir: (L) =>
      `Bir santral veya yönlendirme masasını düşün: Gelen çağrı doğru hatta aktarılır; ${L}, girdilerin hangi modüle yönleneceğini belirleyen anahtarlama mantığıdır.`,
    ornek: (L) =>
      `Mikro servislerde API Gateway, mobil uygulamalarda özellik bayrakları (feature flags) veya ödeme akışında adım adım doğrulama bu desenle örtüşür; ${L} ürün davranışını kontrollü şekilde şekillendirir.`,
    java: `String route = switch (type) {\n    case "A" -> "svc-a";\n    default -> "svc-b";\n};\nclient.call(route);`,
    cpp: `std::string route = (type == "A")\n    ? "svc-a" : "svc-b";\nclient.call(route);`,
  },
  {
    temel: (L) =>
      `${L}, hesaplama adımlarının tekrarını veya veri üzerinde dönüşümü organize eder. Okunabilir ve test edilebilir kod yazmayı kolaylaştırır.`,
    canlandir: (L) =>
      `Excel’de formül zincirini düşün: Bir hücre diğerine bağlıdır; ${L}, yazılımda da verinin hangi adımdan geçerek sonuç ürettiğini gösteren hesap tablosu benzeri bir zincirdir.`,
    ornek: (L) =>
      `Google E-Tablolar fonksiyonları, veri analiz boru hatları (pipeline) veya raporlama motorlarında toplulaştırma adımları bu görünümün parçasıdır; ${L} iş kurallarını şeffaf adımlara böler.`,
    java: `int sum = 0;\nfor (int v : values) {\n    sum += transform(v);\n}\nreturn sum;`,
    cpp: `int sum = 0;\nfor (int v : values) {\n    sum += transform(v);\n}\nreturn sum;`,
  },
];

const generateVisualization = (raw) => {
  const label = formatLabel(raw);
  const key = raw.trim().toLowerCase() || "kavram";
  const h = hashString(key);
  const pack = VISUAL_PACKS[h % VISUAL_PACKS.length];
  const useJava = (h >> 5) % 2 === 0;

  return {
    label,
    temelMantik: pack.temel(label),
    gozundeCanlandir: pack.canlandir(label),
    muhendislikOrnegi: pack.ornek(label),
    codeLang: useJava ? "Java" : "C++",
    codeBody: useJava ? pack.java : pack.cpp,
  };
};

const App = () => {
  const [term, setTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleExplain = useCallback(async () => {
    const trimmed = term.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    await new Promise((resolve) => {
      setTimeout(resolve, PLANT_DELAY_MS);
    });

    setResult(generateVisualization(trimmed));
    setIsLoading(false);
  }, [term, isLoading]);

  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={["#0c0a12", "#12101c", "#0f0e16"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <StatusBar style="light" />
          <KeyboardAvoidingView
            style={styles.keyboard}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <Text style={styles.kicker}>YGA · Empatist</Text>
                <Text style={styles.title}>Görselleştir</Text>
                <Text style={styles.subtitle}>
                  Terimi yaz; temel mantık, zihinsel model ve gerçek ürün
                  örnekleriyle netleştir.
                </Text>
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  value={term}
                  onChangeText={setTerm}
                  placeholder="Teknik terim"
                  placeholderTextColor="#71717a"
                  editable={!isLoading}
                  accessibilityLabel="Teknik terim girişi"
                  returnKeyType="done"
                  onSubmitEditing={handleExplain}
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={handleExplain}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Açıklamayı üret"
                accessibilityState={{ disabled: isLoading }}
                style={({ pressed }) => [
                  styles.button,
                  pressed && !isLoading && styles.buttonPressed,
                  isLoading && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Üretiliyor…" : "Çözümle"}
                </Text>
              </Pressable>

              {isLoading ? (
                <View
                  style={styles.loadingCard}
                  accessibilityRole="progressbar"
                  accessibilityLabel="İçerik hazırlanıyor"
                >
                  <ActivityIndicator color="#c4b5fd" />
                  <Text style={styles.loadingText}>Model hazırlanıyor…</Text>
                </View>
              ) : null}

              {result && !isLoading ? (
                <View style={styles.answerCard}>
                  <View style={styles.answerHeaderRow}>
                    <Text style={styles.answerLabel}>{result.label}</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Sesli okuma — planlanıyor"
                      onPress={() => {
                        /* İleride TTS / erişilebilirlik için entegrasyon. */
                      }}
                      style={styles.iconBtn}
                    >
                      <Text style={styles.iconBtnText}>▶</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.sectionTitle}>Temel Mantık 💡</Text>
                  <Text style={styles.answerBody}>{result.temelMantik}</Text>

                  <View style={styles.divider} />

                  <Text style={styles.sectionTitle}>Gözünde Canlandır 👁️</Text>
                  <Text style={styles.answerBody}>
                    {result.gozundeCanlandir}
                  </Text>

                  <View style={styles.divider} />

                  <Text style={styles.sectionTitle}>
                    Mühendislik Örneği 🛠️
                  </Text>
                  <Text style={styles.answerBody}>
                    {result.muhendislikOrnegi}
                  </Text>

                  <Text style={styles.codeHeader}>Gerçek Kod Kesiti</Text>
                  <View style={styles.codeCard}>
                    <Text style={styles.codeLang}>{result.codeLang}</Text>
                    <Text style={styles.codeText} selectable>
                      {result.codeBody}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.footerSpacer} />
              <Text style={styles.footer}>
                {"Hatice · Yeditepe · Netaş R&D Intern"}
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 26,
  },
  kicker: {
    fontFamily: FONT_UI,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#a78bfa",
    fontWeight: "500",
    marginBottom: 10,
  },
  title: {
    fontFamily: FONT_UI,
    fontSize: 32,
    fontWeight: "300",
    color: "#fafafa",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontFamily: FONT_UI,
    marginTop: 14,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "300",
    color: "#a1a1aa",
    maxWidth: 300,
  },
  inputWrap: {
    borderRadius: 14,
    backgroundColor: "rgba(24, 24, 27, 0.65)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(167, 139, 250, 0.35)",
    marginBottom: 14,
  },
  input: {
    fontFamily: FONT_UI,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: "400",
    color: "#f4f4f5",
    lineHeight: 22,
  },
  button: {
    alignSelf: "center",
    minWidth: 168,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.55)",
    marginBottom: 18,
  },
  buttonPressed: {
    opacity: 0.85,
    backgroundColor: "rgba(167, 139, 250, 0.12)",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    fontFamily: FONT_UI,
    color: "#e9d5ff",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  loadingCard: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: "rgba(24, 24, 27, 0.5)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(113, 113, 122, 0.45)",
  },
  loadingText: {
    fontFamily: FONT_UI,
    marginTop: 12,
    fontSize: 13,
    fontWeight: "400",
    color: "#a1a1aa",
  },
  answerCard: {
    marginTop: 6,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "rgba(18, 18, 22, 0.72)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(139, 92, 246, 0.28)",
  },
  answerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  answerLabel: {
    flex: 1,
    fontFamily: FONT_UI,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#c4b5fd",
  },
  iconBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(161, 161, 170, 0.5)",
    backgroundColor: "rgba(39, 39, 42, 0.6)",
  },
  iconBtnText: {
    fontSize: 12,
    color: "#e4e4e7",
  },
  sectionTitle: {
    fontFamily: FONT_UI,
    fontSize: 13,
    fontWeight: "500",
    color: "#fafafa",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  answerBody: {
    fontFamily: FONT_UI,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "300",
    color: "#d4d4d8",
    marginBottom: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(63, 63, 70, 0.9)",
    marginVertical: 16,
  },
  codeHeader: {
    fontFamily: FONT_UI,
    marginTop: 18,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#a78bfa",
  },
  codeCard: {
    borderRadius: 12,
    backgroundColor: "#08080c",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(82, 82, 91, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  codeLang: {
    fontFamily: FONT_UI,
    fontSize: 10,
    fontWeight: "600",
    color: "#71717a",
    marginBottom: 8,
    letterSpacing: 1,
  },
  codeText: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    lineHeight: 17,
    color: "#e4e4e7",
  },
  footerSpacer: {
    flexGrow: 1,
    minHeight: 20,
  },
  footer: {
    fontFamily: FONT_UI,
    paddingTop: 12,
    textAlign: "center",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "400",
    color: "#71717a",
  },
});
