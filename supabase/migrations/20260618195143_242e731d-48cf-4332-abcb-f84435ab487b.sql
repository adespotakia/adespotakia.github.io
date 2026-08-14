CREATE TABLE public.news_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  image text,
  source text,
  published_date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.news_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_articles TO authenticated;
GRANT ALL ON public.news_articles TO service_role;

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read news articles"
  ON public.news_articles FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert news articles"
  ON public.news_articles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update news articles"
  ON public.news_articles FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete news articles"
  ON public.news_articles FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER set_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.news_articles (title, content, image, source, published_date) VALUES
('Πολίτες και Αδέσποτοι Φίλοι δίνουν 2.000 ευρώ σε όποιον/α δώσει πληροφορίες για το δράστη που δολοφόνησε με φόλες 4 αδέσποτα σκυλιά',
'Αποτροπιασμό και θυμό προκαλεί η εγκληματική ενέργεια από άγνωστο δράστη προς το παρόν, που οδήγησε στο θάνατο ενός ιδιαίτερα αγαπητού αδέσποτου σκύλου, του Νταλάρα, που βρέθηκε νεκρός το πρωί της Δευτέρας, 5 Μαΐου 2025, στην οδό Μιαούλη 50, έχοντας, σύμφωνα με τις πρώτες ενδείξεις, πέσει θύμα δηλητηρίασης με φόλα. Ο Νταλάρας ήταν ιδιαίτερα αγαπητός στην τοπική κοινωνία της Ξάνθης και σύχναζε σε γειτονιές, όπως η Μιαούλη, η Χ. Κοψιδά, η Βελισσαρίου, το Πάρκο Μεγάλου Αλεξάνδρου και η Ευμόλπου. Οι φιλοζωικές οργανώσεις, αλλά και κάτοικοι της περιοχής απευθύνουν έκκληση προς όσους διατηρούν κάμερες ασφαλείας στις συγκεκριμένες περιοχές να τις ελέγξουν για καταγραφές, που ενδέχεται να βοηθήσουν στις έρευνες.',
'https://xanthidaily.gr/wp-content/uploads/2025/05/495138145_1113252867509444_260609085874472809_n-767x520.jpg', 'Δήμος Ξάνθης', '2025-05-02'),
('Τα παιδιά του 6ου Νηπιαγωγείου ζήτησαν και πέτυχαν την τοποθέτηση ταΐστρας και ποτίστρας στο πάρκο του Μ. Αλεξάνδρου',
'Μια συγκινητική και ουσιαστική πρωτοβουλία ανέλαβαν οι μικροί μαθητές του 6ου Νηπιαγωγείου Ξάνθης , στο πλαίσιο υλοποίησης φιλοζωικού προγράμματος που αποσκοπεί στην καλλιέργεια περιβαλλοντικής ευαισθησίας και αγάπης για τα ζώα. Με αφετηρία την επιθυμία να συμβάλουν στην προστασία και φροντίδα των αδέσποτων ζώων της περιοχής, τα παιδιά – με την καθοδήγηση των νηπιαγωγών τους – πρότειναν την τοποθέτηση ταΐστρας και ποτίστρας στο πάρκο του Μεγάλου Αλεξάνδρου, που βρίσκεται δίπλα από το σχολείο τους.',
'https://radio899.gr/sites/default/files/images/23_141.jpg', '6ου Νηπιαγωγείου Ξάνθης', '2025-05-15'),
('Ο Φοίνικας βρήκε μια νέα «οικογένεια» στο 2ο Δημοτικό Σχολείο Ξάνθης',
'Μια συγκινητική και αξιέπαινη πρωτοβουλία πήραν οι μαθητές και οι μαθήτριες του Γ2 τμήματος του 2ου Δημοτικού Σχολείου Ξάνθης, υιοθετώντας τον μικρό Φοίνικα, ένα από τα πολλά αδέσποτα σκυλάκια που φιλοξενούνται στην περιβαλλοντική φιλοζωική οργάνωση Ξάνθης «Αδέσποτοι Φίλοι». Η δράση αυτή εντάσσεται στο πλαίσιο του προγράμματος «πρώτα απόκτησε παιδεία και μετά κατοικίδιο».',
'https://www.xanthinea.gr/wp-content/uploads/2025/05/skilos-2.png', '2ου Δημοτικού Σχολείου Ξάνθης', '2025-05-05'),
('Άγνωστοι έκλεψαν και έκαψαν το φορτηγάκι του σωματείου «Αδεσποτούλια» Ξάνθης',
'Άγνωστοι έκλεψαν και έκαψαν το φορτηγάκι του σωματείου «Αδεσποτούλια Ξάνθης», το βράδυ της περασμένης Πέμπτης, γεγονός που προκαλεί ερωτήματα και αγανάκτηση. Το φορτηγάκι ήταν παλιό, 21 ετών και είχε διανύσει 442.000 χλμ ωστόσο ήταν απαραίτητο για το σωματείο που φροντίζει τα αδέσποτα της Ξάνθης.',
'https://cdn.skai.gr/sites/default/files/styles/style_800x600/public/2025-03/xanthi.png.webp?itok=uSnRpKy1', 'Αδεσποτούλια Ξάνθης', '2025-03-31');