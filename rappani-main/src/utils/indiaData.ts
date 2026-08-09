export const indiaData: Record<string, Record<string, Record<string, string[]>>> = {
  "India": {
    "Tamil Nadu": {
      "Chennai": ["Chennai City", "Guindy", "Velachery", "Tambaram", "T Nagar"],
      "Coimbatore": ["Coimbatore City", "Pollachi", "Mettupalayam", "Sulur"],
      "Madurai": ["Madurai City", "Tirumangalam", "Melur", "Usilampatti"],
      "Tiruchirappalli": ["Trichy City", "Srirangam", "Manapparai", "Lalgudi"],
      "Tirunelveli": ["Tirunelveli City", "Palayamkottai", "Melapalayam", "Ambasamudram", "Tenkasi"],
      "Salem": ["Salem City", "Attur", "Mettur", "Edappadi"],
      "Erode": ["Erode City", "Bhavani", "Gobichettipalayam", "Perundurai"]
    },
    "Kerala": {
      "Thiruvananthapuram": ["Trivandrum City", "Neyyattinkara", "Varkala"],
      "Ernakulam": ["Kochi", "Aluva", "Paravur"],
      "Kozhikode": ["Kozhikode City", "Vadakara", "Koyilandy"]
    },
    "Karnataka": {
      "Bengaluru Urban": ["Bengaluru City", "Yelahanka", "Anekal"],
      "Mysuru": ["Mysuru City", "Hunsur", "Nanjangud"],
      "Dakshina Kannada": ["Mangaluru", "Puttur", "Bantwal"]
    },
    "Maharashtra": {
      "Mumbai City": ["Colaba", "Dadar", "Andheri", "Bandra"],
      "Pune": ["Pune City", "Pimpri-Chinchwad", "Baramati"],
      "Nagpur": ["Nagpur City", "Ramtek", "Kamptee"]
    },
    "Delhi": {
      "New Delhi": ["Connaught Place", "Chanakyapuri", "Vasant Vihar"],
      "South Delhi": ["Saket", "Hauz Khas", "Greater Kailash"]
    }
  }
};

export const getCountries = () => Object.keys(indiaData);
export const getStates = (country: string) => country && indiaData[country as keyof typeof indiaData] ? Object.keys(indiaData[country as keyof typeof indiaData]) : [];
export const getDistricts = (country: string, state: string) => {
  if (!country || !state || !indiaData[country as keyof typeof indiaData]) return [];
  const stateData = indiaData[country as keyof typeof indiaData][state as keyof typeof indiaData[typeof country]];
  return stateData ? Object.keys(stateData) : [];
};
export const getCities = (country: string, state: string, district: string) => {
  if (!country || !state || !district || !indiaData[country as keyof typeof indiaData]) return [];
  const stateData = indiaData[country as keyof typeof indiaData][state as keyof typeof indiaData[typeof country]];
  if (!stateData) return [];
  return stateData[district as keyof typeof stateData] || [];
};
