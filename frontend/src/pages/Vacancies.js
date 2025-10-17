import React from 'react';

const VacancyCard = () => (
  <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
    <h3 style={{ marginBottom: 8 }}>Должность</h3>
    <p style={{ color: '#555', marginBottom: 8 }}><b>Требования</b></p>
    <p style={{ color: '#666' }}>Текст про требования текст про требования текст про требования</p>
    <p style={{ color: '#555', margin: '12px 0 8px' }}><b>Обязанности</b></p>
    <p style={{ color: '#666' }}>Текст про обязанности текст про обязанности текст про обязанности</p>
    <p style={{ color: '#555', margin: '12px 0 8px' }}><b>Условия</b></p>
    <p style={{ color: '#666' }}>Текст про условия текст про условия текст про условия</p>
    <p style={{ marginTop: 12 }}><b>Звоните:</b> +7 (904) 271-35-90</p>
  </div>
);

const Vacancies = () => {
  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <h1 className="section-title" style={{ marginBottom: 16 }}>Вакансии</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {Array.from({ length: 6 }).map((_, i) => <VacancyCard key={i} />)}
      </div>
    </div>
  );
};

export default Vacancies;
