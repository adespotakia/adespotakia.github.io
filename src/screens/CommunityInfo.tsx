
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const CommunityInfo = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Κοινότητα Αδέσποτων</h1>
      <p className="text-lg text-gray-600 mb-8">
        Μάθετε περισσότερα για την κοινότητά μας και πώς μπορείτε να βοηθήσετε τα αδέσποτα ζώα.
      </p>
      
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="about">Σχετικά με εμάς</TabsTrigger>
          <TabsTrigger value="how-to-help">Πως να βοηθήσετε</TabsTrigger>
          <TabsTrigger value="laws">Νομοθεσία</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ποιοι είμαστε</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-7">
                Η κοινότητα αδέσποτων είναι μια εθελοντική ομάδα που ιδρύθηκε το 2020 με στόχο την προστασία και φροντίδα των αδέσποτων ζώων στην Ελλάδα. Αποτελούμαστε από πάνω από 500 ενεργά μέλη σε όλη την ελληνική επικράτεια που συνεργάζονται για την περίθαλψη, στείρωση, εμβολιασμό και υιοθεσία αδέσποτων ζώων.
              </p>
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Το όραμά μας:</h3>
                <p className="text-gray-700 leading-7">
                  Οραματιζόμαστε μια κοινωνία όπου κανένα ζώο δεν θα ζει στους δρόμους χωρίς φροντίδα. Στόχος μας είναι η συνεχής εκπαίδευση του κοινού για την υπεύθυνη ιδιοκτησία κατοικίδιων, η διαρκής φροντίδα των αδέσποτων και η δημιουργία ενός δικτύου αρωγής για όλα τα ζώα που βρίσκονται σε ανάγκη.
                </p>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Οι δράσεις μας:</h3>
                <ul className="list-disc list-inside text-gray-700 leading-7 space-y-2">
                  <li>Περιθάλψη τραυματισμένων και άρρωστων αδέσποτων</li>
                  <li>Προγράμματα στειρώσεων για τον έλεγχο του πληθυσμού</li>
                  <li>Εμβολιασμοί και αποπαρασιτώσεις</li>
                  <li>Εκδηλώσεις υιοθεσίας</li>
                  <li>Ενημερωτικές καμπάνιες και εκπαιδευτικά προγράμματα</li>
                  <li>Συνεργασία με τοπικές αρχές για την εφαρμογή της νομοθεσίας</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Στατιστικά Στοιχεία</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-4xl font-bold text-strays-orange">1.200+</p>
                  <p className="text-gray-600 mt-2">Ζώα που διασώθηκαν</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-4xl font-bold text-strays-orange">850+</p>
                  <p className="text-gray-600 mt-2">Επιτυχημένες υιοθεσίες</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-4xl font-bold text-strays-orange">2.000+</p>
                  <p className="text-gray-600 mt-2">Στειρώσεις & Εμβολιασμοί</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="how-to-help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Τρόποι να βοηθήσετε</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-xl">Γίνετε εθελοντής</h3>
                  <p className="text-gray-700 leading-7">
                    Η συμβολή σας ως εθελοντής είναι ανεκτίμητη για την κοινότητά μας. Μπορείτε να βοηθήσετε με διάφορους τρόπους:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 leading-7 space-y-2">
                    <li>Φιλοξενία αδέσποτων ζώων προσωρινά στο σπίτι σας</li>
                    <li>Μεταφορές ζώων σε κτηνίατρους ή νέες οικογένειες</li>
                    <li>Βοήθεια σε εκδηλώσεις υιοθεσίας</li>
                    <li>Προώθηση των δράσεών μας στα κοινωνικά δίκτυα</li>
                    <li>Φωτογράφηση των ζώων προς υιοθεσία</li>
                  </ul>
                  <Button className="mt-2 bg-strays-orange hover:bg-strays-dark-orange">
                    Εγγραφή εθελοντή
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-xl">Δωρεές</h3>
                  <p className="text-gray-700 leading-7">
                    Οι δωρεές σας μας επιτρέπουν να συνεχίσουμε το έργο μας. Κάθε ποσό, ανεξάρτητα από το μέγεθός του, κάνει τη διαφορά!
                  </p>
                  <p className="text-gray-700 leading-7">
                    Τα χρήματα διατίθενται για:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 leading-7 space-y-2">
                    <li>Ιατροφαρμακευτική περίθαλψη</li>
                    <li>Τροφή για τα αδέσποτα</li>
                    <li>Στειρώσεις και εμβολιασμούς</li>
                    <li>Έξοδα μετακίνησης και διαμονής σε έκτακτες περιπτώσεις</li>
                  </ul>
                  <Button className="mt-2 bg-strays-orange hover:bg-strays-dark-orange">
                    Κάντε μια δωρεά
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-xl">Υιοθεσία</h3>
                  <p className="text-gray-700 leading-7">
                    Η υιοθεσία ενός αδέσποτου είναι ο πιο άμεσος τρόπος να βοηθήσετε. Αν σκέφτεστε να αποκτήσετε ένα ζώο συντροφιάς, επιλέξτε να υιοθετήσετε αντί να αγοράσετε. Όλα τα ζώα μας είναι εμβολιασμένα, αποπαρασιτωμένα και στειρωμένα.
                  </p>
                  <p className="text-gray-700 leading-7">
                    Διαδικασία υιοθεσίας:
                  </p>
                  <ol className="list-decimal list-inside text-gray-700 leading-7 space-y-2">
                    <li>Επικοινωνία με την ομάδα μας</li>
                    <li>Συμπλήρωση φόρμας υιοθεσίας</li>
                    <li>Επίσκεψη για γνωριμία με το ζώο</li>
                    <li>Υπογραφή συμφωνητικού υιοθεσίας</li>
                    <li>Παραλαβή του νέου σας φίλου!</li>
                  </ol>
                  <Button className="mt-2 bg-strays-orange hover:bg-strays-dark-orange">
                    Δείτε ζώα προς υιοθεσία
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="laws" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Νομοθεσία για τα αδέσποτα ζώα</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-xl">Ο Νέος Νόμος 4830/2021</h3>
                  <p className="text-gray-700 leading-7">
                    Ο νέος νόμος 4830/2021 για την ευζωία των ζώων συντροφιάς έφερε σημαντικές αλλαγές στη νομοθεσία για τα αδέσποτα και δεσποζόμενα ζώα στην Ελλάδα. Παρακάτω συνοψίζουμε τις βασικές του προβλέψεις:
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Υποχρεώσεις ιδιοκτητών ζώων συντροφιάς:</h3>
                  <ul className="list-disc list-inside text-gray-700 leading-7 space-y-2">
                    <li>Υποχρεωτική στείρωση για όλα τα ζώα συντροφιάς εκτός αν υπάρχει άδεια εκτροφής</li>
                    <li>Υποχρεωτική σήμανση και καταγραφή στο Εθνικό Μητρώο Ζώων Συντροφιάς</li>
                    <li>Υποχρεωτικός εμβολιασμός</li>
                    <li>Έκδοση διαβατηρίου του ζώου</li>
                    <li>Άμεση περισυλλογή των περιττωμάτων του ζώου από τους κοινόχρηστους χώρους</li>
                    <li>Κατά τη βόλτα, υποχρεωτική χρήση λουριού για σκύλους εντός κατοικημένων περιοχών</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Ποινές για κακοποίηση ζώων:</h3>
                  <p className="text-gray-700 leading-7">
                    Οι ποινές για την κακοποίηση ζώων έχουν αυστηροποιηθεί σημαντικά:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 leading-7 space-y-2">
                    <li>Φυλάκιση έως 10 έτη για βασανισμό ή θανάτωση ζώου</li>
                    <li>Πρόστιμα έως 50.000 ευρώ</li>
                    <li>Αφαίρεση της άδειας κατοχής ζώου συντροφιάς από 1 έως 5 χρόνια</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Διαχείριση αδέσποτων ζώων:</h3>
                  <ul className="list-disc list-inside text-gray-700 leading-7 space-y-2">
                    <li>Οι Δήμοι υποχρεούνται να υλοποιούν προγράμματα διαχείρισης αδέσποτων (περισυλλογή, στείρωση, εμβολιασμός, επανένταξη)</li>
                    <li>Δημιουργία καταφυγίων αδέσποτων ζώων</li>
                    <li>Υποχρέωση σίτισης αδέσποτων ζώων και τοποθέτηση ταϊστρών και ποτιστρών</li>
                    <li>Δυνατότητα υιοθεσίας αδέσποτων μέσω δήμων</li>
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-gray-800 font-medium">Καταγγελία κακοποίησης ζώου:</p>
                  <p className="text-gray-700 mt-2">
                    Αν γίνετε μάρτυρας κακοποίησης ζώου, μπορείτε να καταγγείλετε το περιστατικό:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mt-2">
                    <li>Στην Αστυνομία (100)</li>
                    <li>Στον τοπικό Δήμο</li>
                    <li>Στην ειδική γραμμή καταγγελιών 1110</li>
                  </ul>
                  <p className="text-gray-700 mt-2">
                    Φροντίστε να έχετε στοιχεία όπως φωτογραφίες, βίντεο ή μαρτυρίες.
                  </p>
                </div>

                <Button className="mt-2" variant="outline">
                  Κατέβασε το πλήρες κείμενο του νόμου
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityInfo;
