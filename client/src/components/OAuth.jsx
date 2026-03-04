import { GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "@/redux/user/userSlice";
import { toast } from "sonner";
import api from "@/lib/api";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    dispatch(signInStart());
    try {
      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      dispatch(signInSuccess(res.data.user));
      toast.success("Signed in with Google!");
      const role = res.data.user.role;
      navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Google sign-in failed";
      dispatch(signInFailure(message));
      toast.error(message);
    }
  };

  return (
    <div className="w-full">
      {/* Divider */}
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Google button */}
      <div className="flex justify-center mt-4">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            toast.error("Google sign-in failed");
          }}
          theme="outline"
          size="large"
          width="100%"
          text="continue_with"
          shape="rectangular"
        />
      </div>
    </div>
  );
}
