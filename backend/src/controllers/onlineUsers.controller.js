const activeSessions = new Map();
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos

// ✅ Registrar sesión al hacer login
export const registerLogin = (userData, ip, userAgent) => {
  if (!userData || !userData.id_usuario) {
    console.log('⚠️ No se puede registrar login: userData inválido');
    return;
  }

  const sessionData = {
    userId: userData.id_usuario,
    username: userData.usuario || userData.email,
    nombre: userData.nombre,
    apellido: userData.apellido,
    categoria: userData.categoria,
    lastActivity: new Date(),
    loginTime: new Date(),
    ip: ip,
    userAgent: userAgent
  };
  
  activeSessions.set(userData.id_usuario, sessionData);
  console.log(`✅ LOGIN REGISTRADO: ${sessionData.username} (Total activos: ${activeSessions.size})`);
};

// ✅ Middleware para tracking en rutas protegidas
export const trackUserActivity = (req, res, next) => {
  if (req.user && req.user.id) {
    if (activeSessions.has(req.user.id)) {
      const session = activeSessions.get(req.user.id);
      session.lastActivity = new Date();
      activeSessions.set(req.user.id, session);
    } else {
      // Crear sesión si no existe
      const sessionData = {
        userId: req.user.id,
        username: req.user.usuario,
        nombre: req.user.nombre,
        apellido: req.user.apellido,
        categoria: req.user.categoria,
        lastActivity: new Date(),
        loginTime: new Date(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };
      activeSessions.set(req.user.id, sessionData);
    }
    console.log(`🟢 Actividad registrada: ${req.user.usuario}`);
  }
  next();
};

// ✅ Heartbeat - actualiza la actividad del usuario
export const updateHeartbeat = (req, res) => {
  console.log('💓 Heartbeat recibido');
  console.log('User en req:', req.user);
  
  if (!req.user || !req.user.id) {
    console.log('❌ Heartbeat sin usuario válido');
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  if (activeSessions.has(req.user.id)) {
    const session = activeSessions.get(req.user.id);
    session.lastActivity = new Date();
    activeSessions.set(req.user.id, session);
    
    console.log(`💚 Heartbeat actualizado: ${req.user.usuario} (Total: ${activeSessions.size})`);
    
    res.json({ 
      status: 'active',
      message: 'Heartbeat recibido',
      userId: req.user.id,
      username: req.user.usuario,
      totalOnline: activeSessions.size
    });
  } else {
    // Si no existe sesión, la creamos
    const sessionData = {
      userId: req.user.id,
      username: req.user.usuario,
      nombre: req.user.nombre,
      apellido: req.user.apellido,
      categoria: req.user.categoria,
      lastActivity: new Date(),
      loginTime: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    activeSessions.set(req.user.id, sessionData);
    
    console.log(`💚 Nueva sesión creada en heartbeat: ${req.user.usuario}`);
    
    res.json({ 
      status: 'registered',
      message: 'Nueva sesión registrada',
      totalOnline: activeSessions.size
    });
  }
};

// ✅ Obtener lista de usuarios online
export const getOnlineUsers = (req, res) => {
  const now = new Date();
  
  console.log('📊 Consultando usuarios online...');
  console.log('Total sesiones antes de limpiar:', activeSessions.size);
  
  // Limpiar sesiones inactivas
  for (let [userId, session] of activeSessions.entries()) {
    const inactiveTime = now - new Date(session.lastActivity);
    if (inactiveTime > SESSION_TIMEOUT) {
      console.log(`🗑️ Sesión expirada: ${session.username} (${Math.round(inactiveTime/60000)} min inactivo)`);
      activeSessions.delete(userId);
    }
  }
  
  const onlineUsers = Array.from(activeSessions.values()).map(session => ({
    userId: session.userId,
    username: session.username,
    nombre: session.nombre,
    apellido: session.apellido,
    categoria: session.categoria,
    lastActivity: session.lastActivity,
    loginTime: session.loginTime,
    onlineFor: Math.round((now - new Date(session.loginTime)) / 60000),
    ip: session.ip
  }));
  
  console.log('✅ Usuarios online después de limpiar:', onlineUsers.length);
  console.log('Usuarios:', onlineUsers.map(u => u.username).join(', '));
  
  res.json({
    success: true,
    onlineUsers,
    total: onlineUsers.length,
    lastUpdated: now
  });
};

// ✅ Logout - remover sesión
export const removeUserSession = (req, res) => {
  if (req.user && req.user.id) {
    const session = activeSessions.get(req.user.id);
    const username = session?.username || 'unknown';
    activeSessions.delete(req.user.id);
    console.log(`🔴 LOGOUT: ${username} (Quedan: ${activeSessions.size})`);
    
    res.json({ 
      message: 'Sesión cerrada correctamente',
      remainingUsers: activeSessions.size
    });
  } else {
    res.status(400).json({ message: 'No hay sesión activa' });
  }
};
