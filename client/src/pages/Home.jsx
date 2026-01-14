import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Check, Send } from 'lucide-react';

function Home() {
  const features = [
    {
      icon: <Calendar size={24} />,
      title: '여러 날짜 제안',
      description: '여러 날짜와 시간을 한번에 제안하여 최적의 일정을 찾으세요.'
    },
    {
      icon: <Users size={24} />,
      title: '간편한 참석자 관리',
      description: '참석자에게 개별 응답 링크를 보내고 실시간으로 현황을 확인하세요.'
    },
    {
      icon: <Check size={24} />,
      title: '한눈에 보는 대시보드',
      description: '모든 참석자의 가능 시간을 한눈에 파악하고 최적의 시간을 선택하세요.'
    },
    {
      icon: <Send size={24} />,
      title: '자동 확정 메시지',
      description: '일정 확정 시 이메일, 문자 메시지를 자동으로 생성해드립니다.'
    }
  ];

  return (
    <main className="page">
      <section className="hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="hero-title">
              여러 일정 중 <span>최적의 시간</span>을 찾아보세요
            </h1>
            <p className="hero-subtitle">
              복잡한 일정 조율을 간단하게. 모든 참석자의 가능 시간을 수집하고
              최적의 시간을 선택하세요.
            </p>
            <div className="hero-buttons">
              <Link to="/create" className="btn btn-primary btn-lg">
                일정 만들기
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="feature-card"
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
