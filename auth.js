// =====================================
// BUSCAMED
// Funções de autenticação
// =====================================

async function fazerLogin(email, senha) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password: senha
    });

    if (error) {
        throw error;
    }

    return data.user;
}

async function obterUsuarioAtual() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
        throw error;
    }

    return data.user;
}

async function obterPerfilUsuario(userId) {
    const { data, error } = await supabaseClient
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function fazerLogout() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        throw error;
    }
}