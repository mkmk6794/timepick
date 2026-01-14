import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Check, Send, Clock, Sparkles } from 'lucide-react';

function Home() {
  const features = [
    {
      icon: <Calendar size={28} />,
      title: '여러 날짜 제안',
      description: '여러 날짜와 시간을 한번에 제안하여 최적의 일정을 찾으세요.'
    },
    {
      icon: <Users size={28} />,
      title: '간편한 참석자 관리',
      description: '참석자에게 개별 응답 링크를 보내고 실시간으로 현황을 확인하세요.'
    },
    {
      icon: <Check size={28} />,
      title: '한눈에 보는 대시보드',
      description: '모든 참석자의 가능 시간을 한눈에 파악하고 최적의 시간을 선택하세요.'
    },
    {
      icon: <Send size={28} />,
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
            transition={{ duration: 0.6 }}
          >
            <h1 className="hero-title">
              여러 일정 중<br />
              <span>최적의 시간</span>을 골라보세요
            </h1>
            <p className="hero-subtitle">
              복잡한 일정 조율을 간단하게. 모든 참석자의 가능 시간을 수집하고
              최적의 시간을 선택하여 확정 메시지까지 자동으로 생성합니다.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/create" className="btn btn-primary btn-lg">
                <Clock size={20} />
                일정 만들기
              </Link>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                <Sparkles size={20} />
                사용법 보기
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '1.5rem' 
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card card-hover"
                style={{ padding: '2rem' }}
              >
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  background: 'var(--gradient-primary)', 
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  color: 'white'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" style={{ padding: '4rem 0', background: 'var(--surface)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <h2 style={{ marginBottom: '1rem' }}>사용 방법</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              3단계로 쉽고 빠르게 일정을 조율하세요
            </p>
          </motion.div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {[
              { step: 1, title: '이벤트 생성', desc: '일정 제목과 가능한 날짜/시간을 추가하고 참석자 정보를 입력합니다.' },
              { step: 2, title: '링크 공유', desc: '각 참석자에게 고유한 응답 링크를 이메일로 공유합니다.' },
              { step: 3, title: '일정 확정', desc: '대시보드에서 응답 현황을 확인하고 최적의 시간을 선택하여 확정합니다.' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  alignItems: 'flex-start',
                  padding: '1.5rem',
                  background: 'var(--surface-light)',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--gradient-accent)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.25rem',
                  color: 'var(--background)',
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 style={{ marginBottom: '1.5rem' }}>지금 바로 시작하세요</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              복잡한 회원가입 없이 바로 일정 조율을 시작할 수 있습니다.
            </p>
            <Link to="/create" className="btn btn-accent btn-lg">
              무료로 시작하기
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default Home;
