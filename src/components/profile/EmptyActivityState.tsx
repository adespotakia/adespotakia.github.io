
const EmptyActivityState = () => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      <p className="text-gray-500 text-lg">
        Δεν έχετε ακόμη δραστηριότητες αδέσποτων.
      </p>
      <p className="text-sm text-gray-400 mt-2">
        Οι δραστηριότητες που καταγράφετε για αδέσποτα θα εμφανίζονται εδώ.
      </p>
    </div>
  );
};

export default EmptyActivityState;
