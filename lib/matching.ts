// Matchmaking algorithm for the Discover page

interface Student {
  id: string;
  name: string;
  department: string;
  year: string;
  interests: string[];
}

export function calculateMatchScore(student1: Student, student2: Student): number {
  // Calculate interest overlap
  const commonInterests = student1.interests.filter(interest => student2.interests.includes(interest));
  const interestScore = commonInterests.length / Math.max(student1.interests.length, student2.interests.length);

  // Calculate department match (1 if same, 0.5 if different)
  const departmentScore = student1.department === student2.department ? 1 : 0.5;

  // Calculate year match (1 if same, 0.7 if adjacent, 0.3 otherwise)
  let yearScore = 0.3;
  if (student1.year === student2.year) {
    yearScore = 1;
  } else {
    const years = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
    const index1 = years.indexOf(student1.year);
    const index2 = years.indexOf(student2.year);
    if (Math.abs(index1 - index2) === 1) {
      yearScore = 0.7;
    }
  }

  // Combine scores with weights
  const finalScore = (interestScore * 0.5) + (departmentScore * 0.3) + (yearScore * 0.2);
  return finalScore;
} 