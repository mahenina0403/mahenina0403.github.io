 function Bezier(values, t){
    let n = 3;
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
    let n = 3;
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

function bezierToBarycentric(curve, weight, T){
    let n = 3;
    var Q = [];
    var beta = [];

    for (let i=0; i < n+1; i++){
        Q.push(point_on_bezier(curve, weight, T[i]));
        beta.push(Bezier(weight, T[i]));
    }
    return [Q, beta];
}

function barycentricToBezier(Q, beta, T){
    let n = 3;
    var M = [];
    for(var i=0; i<n+1; i++) {
        M[i] = [];
        for(var j=0; j<n+1; j++) {
            M[i][j] = Bernstein(n,j,T[i]);
        }
    }

    var Xs = [];
    var Ys = [];
    for (let i=0; i < n+1; i++){
        Xs.push(beta[i]*Q[i].x);
        Ys.push(beta[i]*Q[i].y);
    }
    M = math.inv(M);
    var Nx = math.multiply(M,Xs);
    var Ny = math.multiply(M,Ys);
    var alpha = math.multiply(M,beta);

    P = []
    for (let i=0; i<n+1;i++){
        P.push(new Point(Nx[i]/alpha[i], Ny[i]/alpha[i]));
    }
    return [P,alpha];
}