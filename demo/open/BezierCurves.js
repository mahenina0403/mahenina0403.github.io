 function Bezier(values, t){
    let n = values.length-1;
    var N = 0;
    var d = 0;
    var w = [1];
    for (let i=1; i<n+1; i++) w.push(w[i-1]*(n-i+1)/i);
    if (n==0) return curve[0];
    if (t > 0.5){
        let s = (1-t)/t;
        N = values[0];
        d = w[0];
        for (let i=1; i<n+1; i++){
            N = s*N + values[i]*w[i];
            d = d*s + w[i];
        }
    }else{
        let s = t/(1-t);
        N = values[n];
        d = w[n];
        for (let i=0; i<n; i++){
            let j = n-1-i;
            N = N*s + values[j]*w[j];
            d = d*s + w[j];
        }
    }
    return N/d;
}

function Bernstein(n,i,t){
    var values = [];
    for (let j=0; j<n+1; j++){
        if (j==i){
            values.push(1);
        }else{
            values.push(0);
        }
    }
    return Bezier(values,t);
}

function point_on_bezier(curve, weight, t){
    let n = T.length-1;
    var Xs = [];
    var Ys = [];
    for (let i=0; i < n+1; i++){
        Xs.push(weight[i]*curve[i].x);
        Ys.push(weight[i]*curve[i].y);
    }
    var Nx = Bezier(Xs, t);
    var Ny = Bezier(Ys, t);
    var d = Bezier(weight, t);
    
    return new Point(Nx/d, Ny/d);
}

function weights(T){
    let n = T.length-1;
    var w = [];
    for (let i=0; i< n+1; i++){
        let s = 1;
        for (let j=0; j<n+1; j++){
            if (i==j) continue;

            s = s / (T[i]-T[j]);
        }
        w.push(s);
    }
    return w;
}

function point_on_barycentric_curve(curve, weight, T, t){
    let n = T.length-1;
    var Nx = 0;
    var Ny = 0;
    var d = 0;

    for (let i=0; i<n+1; i++){
        if (t-T[i]==0){
            return curve[i];
        }
        let tmp = (-1)**i*weight[i]/(t-T[i]);
        Nx = Nx + tmp * curve[i].x;
        Ny = Ny + tmp * curve[i].y;
        d = d + tmp;
    }

    return new Point(Nx/d, Ny/d);
}

function bezierToBarycentric(curve, weight, T){
    let n = T.length-1;
    var Q = [];
    var beta = [];

    let w = weights(T);

    for (let i=0; i < n+1; i++){
        Q.push(point_on_bezier(curve, weight, T[i]));
        beta.push((-1)**(n+i) * w[i] * Bezier(weight, T[i]));
    }
    return [Q, beta];
}

function barycentricToBezier(Q, beta, T){
    let n = T.length-1;
    var M = [];
    for(var i=0; i<n+1; i++) {
        M[i] = [];
        for(var j=0; j<n+1; j++) {
            M[i][j] = Bernstein(n,j,T[i]);
        }
    }

    let w = weights(T);
    // console.log("weights");
    // console.log(w);
    var Xs = [];
    var Ys = [];
    var z = [];
    for (let i=0; i < n+1; i++){
        let tmp = (-1)**i*beta[i]/w[i];
        Xs.push(tmp*Q[i].x);
        Ys.push(tmp*Q[i].y);
        z.push(tmp);
    }
    M = math.inv(M);
    var Nx = math.multiply(M,Xs);
    var Ny = math.multiply(M,Ys);
    var alpha = math.multiply(M,z);

    P = []
    for (let i=0; i<n+1;i++){
        P.push(new Point(Nx[i]/alpha[i], Ny[i]/alpha[i]));
    }
    return [P,alpha];
}

function slide_tk_update_beta(beta, T, k, new_tk){
    let n = T.length-1;
    var new_beta = [];
    for(var i=0; i<n+1; i++){
        var bk = 0;
        if (i!=k){
            bk = beta[i]*(T[i]-T[k])/(T[i]-new_tk);
            new_beta.push(bk);
            continue;
        }
        var tmp = 0;
        for(var j=0; j < n+1; j++){
            tmp = (-1)**(k+j)* beta[j] * (new_tk - T[k])/(new_tk - T[j]);
            bk = bk + tmp;
        }
        new_beta.push(bk);
    }
    // console.log(new_tk-T[k], "new_beta", new_beta);
    return new_beta;
}

function insert_tk_update_beta(beta, T, k, tk){
    let n = T.length-1;
}