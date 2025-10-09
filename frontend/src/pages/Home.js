import React, { useEffect, useState } from 'react';
import Banner from '../components/Banner/Banner';
import ProductSection from '../components/ProductSection/ProductSection';
import YandexMap from '../components/YandexMap/YandexMap';
import Loading from '../components/Loading/Loading';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import { products as localProducts } from '../data/products';
import { getProductsGrouped } from '../services/api';

const Home = () => {
  const [apiProducts, setApiProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductsGrouped();
      setApiProducts(data);
    } catch (err) {
      console.error('API Error:', err);
      setError('Не удалось загрузить товары с сервера. Показаны локальные данные.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const data = apiProducts || localProducts;

  if (loading) {
    return (
      <main>
        <Banner />
        <Loading size="large" text="Загружаем товары..." />
      </main>
    );
  }

  return (
    <main>
      <Banner />
      
      {error && (
        <ErrorMessage 
          message={error} 
          type="warning"
          onRetry={loadProducts}
        />
      )}
      
      <ProductSection title="Акции" products={data.sales} />
      <ProductSection title="Новинки" products={data.new} />
      <ProductSection title="Популярные ранее" products={data.popular} />

      <section className="special-offers">
        <div className="container">
          <h2 className="section-title">Специальные предложения</h2>
          <div className="offers-grid">
            <div className="offer-card">
              <div className="offer-content">
                <h3>Оформите карту постоянного покупателя</h3>
                <p>Получайте скидки до 10% на все товары</p>
                <button className="offer-btn">Оформить карту</button>
              </div>
              <div className="offer-image">
                <img src="https://dolgovagro.ru/upload/iblock/284/284c6bd1a7ab7a439c8559fecdb5275d.jpg" alt="Карта покупателя" />
              </div>
            </div>

            <div className="offer-card">
              <div className="offer-content">
                <h3>Подпишитесь на рассылку</h3>
                <p>Узнавайте первыми о новых акциях и скидках</p>
                <button className="offer-btn">Подписаться</button>
              </div>
              <div className="offer-image">
                <img src="https://sendsay.ru/blog/storage/2022/06/03/81ab75cb694e3ce19861eb1070678bd123b979ec.svg" alt="Рассылка" />
              </div>
            </div>

            <div className="offer-card">
              <div className="offer-content">
                <h3>Корзина полная радости</h3>
                <p>Соберите корзину на сумму от 2000₽ и получите подарок</p>
                <button className="offer-btn">Узнать больше</button>
              </div>
              <div className="offer-image">
                <img src="https://s2.stc.all.kpcdn.net/putevoditel/projectid_534672/images/tild3532-3762-4634-b563-623562663835__3dec_header.png" alt="Подарок" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <YandexMap />

      <section className="blog-section">
        <div className="container">
          <h2 className="section-title">Статьи</h2>
          <div className="blog-grid">
            <article className="blog-card">
              <div className="blog-image">
                <img src="https://grozny.tv/storage/images/88752a9a-74ee-4dc6-903b-23b87f44ebff.jpg" alt="Здоровое питание" />
              </div>
              <div className="blog-content">
                <h3>Основы здорового питания: что нужно знать каждому</h3>
                <p>Разбираемся в принципах правильного питания и составляем сбалансированный рацион на каждый день.</p>
                <button className="blog-btn">Читать далее</button>
              </div>
            </article>

            <article className="blog-card">
              <div className="blog-image">
                <img src="https://здоровое-питание.рф/upload/iblock/756/r02zyyuxswwq95uq6gnz7pj2z2q5w07f/-Tatjana-Baibakova-Fotobank-Lori_statya-_1_-_1_-_1_.jpg" alt="Сезонные продукты" />
              </div>
              <div className="blog-content">
                <h3>Сезонные продукты: польза местных овощей и фруктов</h3>
                <p>Почему стоит выбирать сезонные продукты и как они влияют на наше здоровье и кошелек.</p>
                <button className="blog-btn">Читать далее</button>
              </div>
            </article>

            <article className="blog-card">
              <div className="blog-image">
                <img src="https://cdn.litres.ru/pub/c/cover/70982377.jpg" alt="Рецепты" />
              </div>
              <div className="blog-content">
                <h3>ТОП-10 быстрых рецептов для занятых людей</h3>
                <p>Простые и вкусные блюда, которые можно приготовить за 15-30 минут из доступных продуктов.</p>
                <button className="blog-btn">Читать далее</button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
